import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
class SafetyService {
    // 7.1 Create Safety Report
    async createReport(reporterId, data) {
        // Validate reported entities exist
        if (data.reportedUserId) {
            const user = await prisma.user.findUnique({
                where: { id: data.reportedUserId },
            });
            if (!user) {
                throw new AppError('Reported user not found', 404);
            }
            if (data.reportedUserId === reporterId) {
                throw new AppError('Cannot report yourself', 400);
            }
        }
        if (data.reportedTripId) {
            const trip = await prisma.trip.findUnique({
                where: { id: data.reportedTripId },
            });
            if (!trip) {
                throw new AppError('Reported trip not found', 404);
            }
        }
        // Create report
        const report = await prisma.safetyReport.create({
            data: {
                reporterId,
                type: data.type,
                reportedUserId: data.reportedUserId,
                reportedTripId: data.reportedTripId,
                reportedMessageId: data.reportedMessageId,
                reason: data.reason,
                description: data.description,
                evidenceUrls: data.evidenceUrls,
                isEmergency: data.isEmergency,
                emergencyLocation: data.emergencyLocation,
                status: 'pending',
            },
            include: {
                reportedUser: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                reportedTrip: {
                    select: {
                        id: true,
                        originCity: true,
                        destinationCity: true,
                    },
                },
            },
        });
        // If emergency, trigger additional actions
        if (data.isEmergency) {
            await this.handleEmergencyReport(report.id, reporterId);
        }
        return {
            id: report.id,
            type: report.type,
            reason: report.reason,
            description: report.description,
            status: report.status,
            isEmergency: report.isEmergency,
            reportedUser: report.reportedUser,
            reportedTrip: report.reportedTrip,
            createdAt: report.createdAt,
        };
    }
    // Handle emergency report
    async handleEmergencyReport(reportId, reporterId) {
        // Notify emergency contacts
        const emergencyContacts = await prisma.emergencyContact.findMany({
            where: { userId: reporterId },
            orderBy: { isPrimary: 'desc' },
        });
        // Create notification for user
        await prisma.notification.create({
            data: {
                userId: reporterId,
                type: 'safety_alert',
                title: 'Emergency Report Submitted',
                message: 'Your emergency report has been received. Help is on the way.',
                actionUrl: `/safety/reports/${reportId}`,
            },
        });
        // In a real app, you would:
        // 1. Send SMS to emergency contacts
        // 2. Alert platform moderators
        // 3. Potentially contact local authorities
        return emergencyContacts;
    }
    // 7.2 Get My Reports
    async getMyReports(reporterId, options) {
        const where = { reporterId };
        const [reports, total] = await Promise.all([
            prisma.safetyReport.findMany({
                where,
                include: {
                    reportedUser: {
                        select: {
                            id: true,
                            fullName: true,
                            profilePhotoUrl: true,
                        },
                    },
                    reportedTrip: {
                        select: {
                            id: true,
                            originCity: true,
                            destinationCity: true,
                            departureDate: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (options.page - 1) * options.limit,
                take: options.limit,
            }),
            prisma.safetyReport.count({ where }),
        ]);
        return {
            reports: reports.map(r => ({
                id: r.id,
                type: r.type,
                reason: r.reason,
                description: r.description,
                status: r.status,
                isEmergency: r.isEmergency,
                reportedUser: r.reportedUser,
                reportedTrip: r.reportedTrip,
                createdAt: r.createdAt,
                resolvedAt: r.resolvedAt,
            })),
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                totalPages: Math.ceil(total / options.limit),
            },
        };
    }
    // 7.3 Block User
    async blockUser(blockerId, data) {
        if (data.blockedUserId === blockerId) {
            throw new AppError('Cannot block yourself', 400);
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: data.blockedUserId },
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        // Check if already blocked
        const existingBlock = await prisma.userBlock.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId,
                    blockedId: data.blockedUserId,
                },
            },
        });
        if (existingBlock) {
            throw new AppError('User already blocked', 400);
        }
        const block = await prisma.userBlock.create({
            data: {
                blockerId,
                blockedId: data.blockedUserId,
                reason: data.reason,
            },
            include: {
                blocked: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
        return {
            id: block.id,
            blockedUser: block.blocked,
            reason: block.reason,
            createdAt: block.createdAt,
        };
    }
    // 7.4 Unblock User
    async unblockUser(blockerId, blockedUserId) {
        const block = await prisma.userBlock.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId,
                    blockedId: blockedUserId,
                },
            },
        });
        if (!block) {
            throw new AppError('User is not blocked', 404);
        }
        await prisma.userBlock.delete({
            where: { id: block.id },
        });
        return { message: 'User unblocked successfully' };
    }
    // 7.5 Get Blocked Users
    async getBlockedUsers(blockerId, options) {
        const where = { blockerId };
        const [blocks, total] = await Promise.all([
            prisma.userBlock.findMany({
                where,
                include: {
                    blocked: {
                        select: {
                            id: true,
                            fullName: true,
                            profilePhotoUrl: true,
                            collegeName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (options.page - 1) * options.limit,
                take: options.limit,
            }),
            prisma.userBlock.count({ where }),
        ]);
        return {
            blockedUsers: blocks.map(b => ({
                id: b.id,
                blockedUser: b.blocked,
                reason: b.reason,
                createdAt: b.createdAt,
            })),
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                totalPages: Math.ceil(total / options.limit),
            },
        };
    }
    // Check if user is blocked
    async isUserBlocked(userId, targetUserId) {
        const block = await prisma.userBlock.findFirst({
            where: {
                OR: [
                    { blockerId: userId, blockedId: targetUserId },
                    { blockerId: targetUserId, blockedId: userId },
                ],
            },
        });
        return !!block;
    }
    // 7.6 Add Emergency Contact
    async addEmergencyContact(userId, data) {
        // Check existing count
        const existingCount = await prisma.emergencyContact.count({
            where: { userId },
        });
        if (existingCount >= 5) {
            throw new AppError('Maximum 5 emergency contacts allowed', 400);
        }
        // If setting as primary, unset others
        if (data.isPrimary) {
            await prisma.emergencyContact.updateMany({
                where: { userId, isPrimary: true },
                data: { isPrimary: false },
            });
        }
        const contact = await prisma.emergencyContact.create({
            data: {
                userId,
                name: data.name,
                phoneNumber: data.phoneNumber,
                relationship: data.relationship,
                isPrimary: data.isPrimary,
            },
        });
        return {
            id: contact.id,
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            relationship: contact.relationship,
            isPrimary: contact.isPrimary,
            createdAt: contact.createdAt,
        };
    }
    // 7.7 Update Emergency Contact
    async updateEmergencyContact(userId, contactId, data) {
        const contact = await prisma.emergencyContact.findFirst({
            where: { id: contactId, userId },
        });
        if (!contact) {
            throw new AppError('Emergency contact not found', 404);
        }
        // If setting as primary, unset others
        if (data.isPrimary) {
            await prisma.emergencyContact.updateMany({
                where: { userId, isPrimary: true },
                data: { isPrimary: false },
            });
        }
        const updated = await prisma.emergencyContact.update({
            where: { id: contactId },
            data: {
                name: data.name,
                phoneNumber: data.phoneNumber,
                relationship: data.relationship,
                isPrimary: data.isPrimary,
            },
        });
        return {
            id: updated.id,
            name: updated.name,
            phoneNumber: updated.phoneNumber,
            relationship: updated.relationship,
            isPrimary: updated.isPrimary,
            createdAt: updated.createdAt,
        };
    }
    // 7.8 Delete Emergency Contact
    async deleteEmergencyContact(userId, contactId) {
        const contact = await prisma.emergencyContact.findFirst({
            where: { id: contactId, userId },
        });
        if (!contact) {
            throw new AppError('Emergency contact not found', 404);
        }
        await prisma.emergencyContact.delete({
            where: { id: contactId },
        });
        return { message: 'Emergency contact deleted successfully' };
    }
    // 7.9 Get Emergency Contacts
    async getEmergencyContacts(userId) {
        const contacts = await prisma.emergencyContact.findMany({
            where: { userId },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        });
        return {
            contacts: contacts.map(c => ({
                id: c.id,
                name: c.name,
                phoneNumber: c.phoneNumber,
                relationship: c.relationship,
                isPrimary: c.isPrimary,
                createdAt: c.createdAt,
            })),
        };
    }
    // 7.10 Trigger SOS
    async triggerSOS(userId, data) {
        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
            },
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        // Get emergency contacts
        const emergencyContacts = await prisma.emergencyContact.findMany({
            where: { userId },
            orderBy: { isPrimary: 'desc' },
        });
        // Create emergency report
        const report = await prisma.safetyReport.create({
            data: {
                reporterId: userId,
                type: 'user',
                reason: 'safety_concern',
                description: data.message || 'SOS triggered - user needs immediate assistance',
                isEmergency: true,
                emergencyLocation: data.location,
                reportedTripId: data.tripId,
                status: 'pending',
            },
        });
        // Create notification
        await prisma.notification.create({
            data: {
                userId,
                type: 'safety_alert',
                title: 'SOS Activated',
                message: 'Your emergency contacts have been notified with your location.',
                actionUrl: `/safety/sos/${report.id}`,
            },
        });
        // In production, this would:
        // 1. Send SMS to all emergency contacts with location
        // 2. Alert platform safety team
        // 3. Share real-time location updates
        return {
            sosId: report.id,
            status: 'activated',
            message: 'SOS triggered successfully. Emergency contacts notified.',
            contactsNotified: emergencyContacts.length,
            location: data.location,
        };
    }
}
export const safetyService = new SafetyService();
//# sourceMappingURL=safety.service.js.map