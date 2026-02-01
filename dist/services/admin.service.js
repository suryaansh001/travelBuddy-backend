import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
// Helper to log admin actions
const logAdminAction = async (adminId, action, targetType, targetId, details) => {
    const logEntry = {
        adminId,
        action,
        targetType,
        targetId,
        details: details || {},
        timestamp: new Date().toISOString(),
    };
    // Store in Redis for real-time access
    await redis.lpush('admin:logs', JSON.stringify(logEntry));
    await redis.ltrim('admin:logs', 0, 9999); // Keep last 10k logs
};
// 10.2 Moderate User
export const moderateUser = async (adminId, targetUserId, data) => {
    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, fullName: true, isBlocked: true, isVerified: true },
    });
    if (!user)
        throw new Error('User not found');
    let updateData = {};
    let message = '';
    switch (data.action) {
        case 'block':
            updateData = { isBlocked: true, isActive: false };
            message = `User ${user.fullName} has been blocked`;
            break;
        case 'unblock':
            updateData = { isBlocked: false, isActive: true };
            message = `User ${user.fullName} has been unblocked`;
            break;
        case 'verify':
            updateData = { isVerified: true, emailVerified: true };
            message = `User ${user.fullName} has been verified`;
            break;
        case 'unverify':
            updateData = { isVerified: false };
            message = `User ${user.fullName} verification has been revoked`;
            break;
        case 'warn':
            // Create a notification warning
            await prisma.notification.create({
                data: {
                    userId: targetUserId,
                    type: 'safety_alert',
                    title: 'Account Warning',
                    message: data.reason || 'Your account has received a warning from administrators.',
                },
            });
            message = `Warning sent to ${user.fullName}`;
            break;
    }
    if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
            where: { id: targetUserId },
            data: updateData,
        });
    }
    // Log admin action
    await logAdminAction(adminId, `moderate_user_${data.action}`, 'user', targetUserId, {
        reason: data.reason,
        duration: data.duration,
    });
    const updatedUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, fullName: true, isBlocked: true, isVerified: true },
    });
    return {
        success: true,
        user: updatedUser,
        message,
    };
};
// 10.3 Review Reports
export const getReports = async (params) => {
    const { status, type, page, limit, sortBy, sortOrder } = params;
    const where = {};
    if (status)
        where.status = status;
    if (type)
        where.type = type;
    const [reports, total] = await Promise.all([
        prisma.safetyReport.findMany({
            where,
            include: {
                reporter: { select: { id: true, fullName: true, email: true } },
                reportedUser: { select: { id: true, fullName: true, email: true } },
                reportedTrip: { select: { id: true, title: true } },
            },
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.safetyReport.count({ where }),
    ]);
    return {
        reports: reports.map((r) => ({
            id: r.id,
            type: r.type,
            status: r.status,
            description: r.description,
            createdAt: r.createdAt,
            reporter: r.reporter,
            reportedUser: r.reportedUser,
            reportedTrip: r.reportedTrip,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
// Update Report Status
export const updateReportStatus = async (adminId, reportId, data) => {
    const report = await prisma.safetyReport.findUnique({
        where: { id: reportId },
    });
    if (!report)
        throw new Error('Report not found');
    const updateData = {
        status: data.status,
        moderatorNotes: data.adminNotes,
        actionTaken: data.actionTaken,
    };
    if (data.status === 'resolved' || data.status === 'dismissed') {
        updateData.resolvedAt = new Date();
        updateData.assignedModeratorId = adminId;
    }
    const updated = await prisma.safetyReport.update({
        where: { id: reportId },
        data: updateData,
        select: { id: true, status: true, resolvedAt: true },
    });
    await logAdminAction(adminId, 'update_report_status', 'report', reportId, {
        newStatus: data.status,
        actionTaken: data.actionTaken,
    });
    return { report: updated };
};
// 10.4 Bulk Actions
export const performBulkAction = async (adminId, data) => {
    const results = [];
    let processed = 0;
    let failed = 0;
    for (const userId of data.userIds) {
        try {
            switch (data.action) {
                case 'block':
                    await prisma.user.update({
                        where: { id: userId },
                        data: { isBlocked: true, isActive: false },
                    });
                    break;
                case 'unblock':
                    await prisma.user.update({
                        where: { id: userId },
                        data: { isBlocked: false, isActive: true },
                    });
                    break;
                case 'verify':
                    await prisma.user.update({
                        where: { id: userId },
                        data: { isVerified: true, emailVerified: true },
                    });
                    break;
                case 'unverify':
                    await prisma.user.update({
                        where: { id: userId },
                        data: { isVerified: false },
                    });
                    break;
                case 'sendNotification':
                    if (data.notificationMessage) {
                        await prisma.notification.create({
                            data: {
                                userId,
                                type: 'safety_alert',
                                title: 'Admin Notification',
                                message: data.notificationMessage,
                            },
                        });
                    }
                    break;
            }
            results.push({ userId, success: true });
            processed++;
        }
        catch (error) {
            results.push({
                userId,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            failed++;
        }
    }
    await logAdminAction(adminId, `bulk_${data.action}`, 'users', 'bulk', {
        userCount: data.userIds.length,
        reason: data.reason,
        processed,
        failed,
    });
    return {
        success: failed === 0,
        processed,
        failed,
        results,
    };
};
// 10.5 Content Moderation - Search
export const searchContent = async (params) => {
    const { contentType, query, flagged, page, limit } = params;
    if (contentType === 'trip') {
        const where = {};
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ];
        }
        if (flagged !== undefined) {
            where.isActive = !flagged;
        }
        const [trips, total] = await Promise.all([
            prisma.trip.findMany({
                where,
                include: { creator: { select: { id: true, fullName: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.trip.count({ where }),
        ]);
        return {
            content: trips.map((t) => ({
                id: t.id,
                type: 'trip',
                content: `${t.title || 'Untitled'}: ${t.description || ''}`,
                createdAt: t.createdAt,
                creator: t.creator,
                isActive: t.isActive,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    else {
        const where = {};
        // ChatMessage uses payload JSON field, not content text field
        // We filter on isFlagged instead of text search for messages
        if (flagged !== undefined) {
            where.isFlagged = flagged;
        }
        const [messages, total] = await Promise.all([
            prisma.chatMessage.findMany({
                where,
                include: { sender: { select: { id: true, fullName: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.chatMessage.count({ where }),
        ]);
        return {
            content: messages.map((m) => ({
                id: m.id,
                type: 'message',
                content: typeof m.payload === 'object' && m.payload !== null && 'text' in m.payload
                    ? String(m.payload.text || '[Media/System Message]')
                    : '[Media/System Message]',
                createdAt: m.createdAt,
                creator: m.sender,
                isActive: !m.isDeleted,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
// Moderate Content
export const moderateContent = async (adminId, contentType, contentId, data) => {
    if (contentType === 'trip') {
        const trip = await prisma.trip.findUnique({ where: { id: contentId } });
        if (!trip)
            throw new Error('Trip not found');
        switch (data.action) {
            case 'approve':
                await prisma.trip.update({
                    where: { id: contentId },
                    data: { isActive: true },
                });
                break;
            case 'remove':
                await prisma.trip.update({
                    where: { id: contentId },
                    data: { isActive: false, status: 'cancelled' },
                });
                break;
            case 'flag':
                await prisma.trip.update({
                    where: { id: contentId },
                    data: { isActive: false },
                });
                break;
        }
    }
    else {
        const message = await prisma.chatMessage.findUnique({ where: { id: contentId } });
        if (!message)
            throw new Error('Message not found');
        switch (data.action) {
            case 'approve':
                await prisma.chatMessage.update({
                    where: { id: contentId },
                    data: { isDeleted: false, isFlagged: false },
                });
                break;
            case 'remove':
                await prisma.chatMessage.update({
                    where: { id: contentId },
                    data: { isDeleted: true },
                });
                break;
            case 'flag':
                await prisma.chatMessage.update({
                    where: { id: contentId },
                    data: { isFlagged: true },
                });
                break;
        }
    }
    await logAdminAction(adminId, `moderate_content_${data.action}`, contentType, contentId, {
        reason: data.reason,
    });
    return {
        success: true,
        message: `Content ${data.action}d successfully`,
    };
};
// 10.6 System Logs
export const getSystemLogs = async (params) => {
    const { startDate, endDate, eventType, userId, page, limit } = params;
    // Get logs from Redis
    const start = (page - 1) * limit;
    const end = start + limit;
    const rawLogs = await redis.lrange('admin:logs', start, end);
    let logs = rawLogs.map((log) => JSON.parse(log));
    // Filter by criteria
    if (startDate) {
        logs = logs.filter((l) => new Date(l.timestamp) >= startDate);
    }
    if (endDate) {
        logs = logs.filter((l) => new Date(l.timestamp) <= endDate);
    }
    if (eventType) {
        logs = logs.filter((l) => l.action.includes(eventType));
    }
    if (userId) {
        logs = logs.filter((l) => l.targetId === userId || l.adminId === userId);
    }
    const totalLogs = await redis.llen('admin:logs');
    return {
        logs,
        pagination: {
            page,
            limit,
            hasMore: end < totalLogs,
        },
    };
};
// 10.7 College Whitelist Management
// Note: Since there's no CollegeWhitelist model in schema, we'll use Redis
export const getCollegeWhitelist = async (params) => {
    const { search, isActive, page, limit } = params;
    // Get all colleges from Redis hash
    const collegesRaw = await redis.hgetall('admin:college_whitelist');
    let colleges = Object.entries(collegesRaw).map(([domain, data]) => ({
        collegeDomain: domain,
        ...JSON.parse(data),
    }));
    // Filter
    if (search) {
        const searchLower = search.toLowerCase();
        colleges = colleges.filter((c) => c.collegeDomain.toLowerCase().includes(searchLower) ||
            c.collegeName.toLowerCase().includes(searchLower));
    }
    if (isActive !== undefined) {
        colleges = colleges.filter((c) => c.isActive === isActive);
    }
    const total = colleges.length;
    const startIdx = (page - 1) * limit;
    const paginatedColleges = colleges.slice(startIdx, startIdx + limit);
    return {
        colleges: paginatedColleges,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const addCollegeToWhitelist = async (adminId, data) => {
    // Check if already exists
    const existing = await redis.hget('admin:college_whitelist', data.collegeDomain);
    if (existing) {
        throw new Error('College domain already exists in whitelist');
    }
    const collegeData = {
        collegeName: data.collegeName,
        isActive: data.isActive,
        addedAt: new Date().toISOString(),
        addedBy: adminId,
    };
    await redis.hset('admin:college_whitelist', data.collegeDomain, JSON.stringify(collegeData));
    await logAdminAction(adminId, 'add_college_whitelist', 'college', data.collegeDomain, {
        collegeName: data.collegeName,
    });
    return {
        success: true,
        college: {
            collegeDomain: data.collegeDomain,
            collegeName: data.collegeName,
            isActive: data.isActive,
        },
    };
};
export const updateCollegeWhitelist = async (adminId, collegeDomain, data) => {
    const existing = await redis.hget('admin:college_whitelist', collegeDomain);
    if (!existing) {
        throw new Error('College not found in whitelist');
    }
    const collegeData = JSON.parse(existing);
    if (data.collegeName !== undefined) {
        collegeData.collegeName = data.collegeName;
    }
    if (data.isActive !== undefined) {
        collegeData.isActive = data.isActive;
    }
    await redis.hset('admin:college_whitelist', collegeDomain, JSON.stringify(collegeData));
    await logAdminAction(adminId, 'update_college_whitelist', 'college', collegeDomain, data);
    return {
        success: true,
        college: {
            collegeDomain,
            collegeName: collegeData.collegeName,
            isActive: collegeData.isActive,
        },
    };
};
export const removeCollegeFromWhitelist = async (adminId, collegeDomain) => {
    const existing = await redis.hget('admin:college_whitelist', collegeDomain);
    if (!existing) {
        throw new Error('College not found in whitelist');
    }
    await redis.hdel('admin:college_whitelist', collegeDomain);
    await logAdminAction(adminId, 'remove_college_whitelist', 'college', collegeDomain);
    return { success: true };
};
//# sourceMappingURL=admin.service.js.map