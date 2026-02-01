import { prisma } from '../config/database.js';
import { redis, REDIS_KEYS, REDIS_TTL } from '../config/redis.js';
import { generateOTP } from '../utils/crypto.js';
import { AppError } from '../middleware/errorHandler.js';
import { PREDEFINED_INTERESTS } from '../validators/user.validator.js';
export class UserService {
    // 2.1 Get Own Profile
    async getOwnProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                fullName: true,
                profilePhotoUrl: true,
                collegeName: true,
                collegeDomain: true,
                department: true,
                yearOfStudy: true,
                phoneNumber: true,
                phoneVerified: true,
                bio: true,
                gender: true,
                preferredGender: true,
                trustScore: true,
                totalTripsCompleted: true,
                totalTripsCancelled: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                interests: {
                    select: { interest: true },
                },
                emergencyContacts: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        relationship: true,
                        isPrimary: true,
                    },
                    orderBy: { isPrimary: 'desc' },
                },
                _count: {
                    select: {
                        createdTrips: true,
                        reviewsReceived: true,
                    },
                },
            },
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        // Calculate cancellation rate
        const cancellationRate = await this.getCancellationRate(userId);
        // Get average rating
        const avgRating = await this.getAverageRating(userId);
        return {
            ...user,
            interests: user.interests.map(i => i.interest),
            totalTripsCreated: user._count.createdTrips,
            totalReviews: user._count.reviewsReceived,
            averageRating: avgRating,
            cancellationRate,
        };
    }
    // 2.2 Get Other User Profile (Public View)
    async getPublicProfile(userId, viewerId) {
        // Check if viewer has blocked the user or is blocked by them
        if (viewerId) {
            const block = await prisma.userBlock.findFirst({
                where: {
                    OR: [
                        { blockerId: viewerId, blockedId: userId },
                        { blockerId: userId, blockedId: viewerId },
                    ],
                },
            });
            if (block) {
                throw new AppError('User not found', 404);
            }
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                profilePhotoUrl: true,
                collegeName: true,
                department: true,
                yearOfStudy: true,
                bio: true,
                gender: true,
                trustScore: true,
                totalTripsCompleted: true,
                isVerified: true,
                createdAt: true,
                interests: {
                    select: { interest: true },
                },
                reviewsReceived: {
                    where: {
                        isPublic: true,
                        type: 'companion',
                    },
                    select: {
                        id: true,
                        overallRating: true,
                        comment: true,
                        positiveTags: true,
                        createdAt: true,
                        reviewer: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePhotoUrl: true,
                            },
                        },
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        createdTrips: { where: { status: 'completed' } },
                        reviewsReceived: { where: { isPublic: true } },
                    },
                },
            },
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        const avgRating = await this.getAverageRating(userId);
        const cancellationRate = await this.getCancellationRate(userId);
        return {
            ...user,
            interests: user.interests.map(i => i.interest),
            totalTripsCompleted: user._count.createdTrips,
            totalReviews: user._count.reviewsReceived,
            averageRating: avgRating,
            cancellationRate,
        };
    }
    // 2.3 Update Profile
    async updateProfile(userId, data) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.fullName && { fullName: data.fullName }),
                ...(data.bio !== undefined && { bio: data.bio }),
                ...(data.department !== undefined && { department: data.department }),
                ...(data.yearOfStudy !== undefined && { yearOfStudy: data.yearOfStudy }),
                ...(data.gender !== undefined && { gender: data.gender }),
                ...(data.preferredGender !== undefined && { preferredGender: data.preferredGender }),
            },
            select: {
                id: true,
                fullName: true,
                bio: true,
                department: true,
                yearOfStudy: true,
                gender: true,
                preferredGender: true,
                updatedAt: true,
            },
        });
        return user;
    }
    // 2.5 Manage Interests
    async updateInterests(userId, data) {
        // Validate interests against predefined list
        const validInterests = data.interests.filter(interest => PREDEFINED_INTERESTS.includes(interest.toLowerCase()));
        if (validInterests.length === 0) {
            throw new AppError('No valid interests provided', 400);
        }
        // Delete existing interests
        await prisma.userInterest.deleteMany({
            where: { userId },
        });
        // Create new interests
        await prisma.userInterest.createMany({
            data: validInterests.map(interest => ({
                userId,
                interest: interest.toLowerCase(),
            })),
        });
        return { interests: validInterests };
    }
    // 2.6 Add Emergency Contact
    async addEmergencyContact(userId, data) {
        // Check limit (max 3)
        const existingCount = await prisma.emergencyContact.count({
            where: { userId },
        });
        if (existingCount >= 3) {
            throw new AppError('Maximum 3 emergency contacts allowed', 400);
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
                isPrimary: data.isPrimary || existingCount === 0, // First contact is primary by default
            },
        });
        return contact;
    }
    // 2.7 Update Emergency Contact
    async updateEmergencyContact(userId, contactId, data) {
        // Verify ownership
        const contact = await prisma.emergencyContact.findFirst({
            where: { id: contactId, userId },
        });
        if (!contact) {
            throw new AppError('Emergency contact not found', 404);
        }
        // If setting as primary, unset others
        if (data.isPrimary) {
            await prisma.emergencyContact.updateMany({
                where: { userId, isPrimary: true, id: { not: contactId } },
                data: { isPrimary: false },
            });
        }
        const updatedContact = await prisma.emergencyContact.update({
            where: { id: contactId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
                ...(data.relationship !== undefined && { relationship: data.relationship }),
                ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
            },
        });
        return updatedContact;
    }
    // 2.8 Delete Emergency Contact
    async deleteEmergencyContact(userId, contactId) {
        // Verify ownership
        const contact = await prisma.emergencyContact.findFirst({
            where: { id: contactId, userId },
        });
        if (!contact) {
            throw new AppError('Emergency contact not found', 404);
        }
        await prisma.emergencyContact.delete({
            where: { id: contactId },
        });
        // If was primary, promote next contact
        if (contact.isPrimary) {
            const nextContact = await prisma.emergencyContact.findFirst({
                where: { userId },
                orderBy: { createdAt: 'asc' },
            });
            if (nextContact) {
                await prisma.emergencyContact.update({
                    where: { id: nextContact.id },
                    data: { isPrimary: true },
                });
            }
        }
        return { message: 'Emergency contact deleted successfully' };
    }
    // 2.9 Get User Statistics
    async getUserStatistics(userId) {
        const [user, tripsCreated, tripsJoined, reviewsReceived] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    trustScore: true,
                    totalTripsCompleted: true,
                    totalTripsCancelled: true,
                },
            }),
            prisma.trip.count({
                where: { createdBy: userId },
            }),
            prisma.match.count({
                where: { matchedUserId: userId, status: 'accepted' },
            }),
            prisma.review.count({
                where: { reviewedUserId: userId },
            }),
        ]);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        const avgRating = await this.getAverageRating(userId);
        const cancellationRate = await this.getCancellationRate(userId);
        // Calculate response rate
        const swipesReceived = await prisma.swipe.count({
            where: {
                trip: { createdBy: userId },
                direction: { in: ['right', 'super'] },
            },
        });
        const swipesResponded = await prisma.match.count({
            where: { tripCreatorId: userId },
        });
        const responseRate = swipesReceived > 0
            ? Math.round((swipesResponded / swipesReceived) * 100)
            : 100;
        return {
            trustScore: user.trustScore,
            totalTripsCompleted: user.totalTripsCompleted,
            totalTripsCancelled: user.totalTripsCancelled,
            totalTripsCreated: tripsCreated,
            totalTripsJoined: tripsJoined,
            totalReviews: reviewsReceived,
            averageRating: avgRating,
            cancellationRate,
            responseRate,
        };
    }
    // 2.10 Block User
    async blockUser(userId, blockedUserId, reason) {
        if (userId === blockedUserId) {
            throw new AppError('You cannot block yourself', 400);
        }
        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: blockedUserId },
            select: { id: true },
        });
        if (!targetUser) {
            throw new AppError('User not found', 404);
        }
        // Check if already blocked
        const existingBlock = await prisma.userBlock.findUnique({
            where: {
                blockerId_blockedId: { blockerId: userId, blockedId: blockedUserId },
            },
        });
        if (existingBlock) {
            throw new AppError('User is already blocked', 400);
        }
        await prisma.userBlock.create({
            data: {
                blockerId: userId,
                blockedId: blockedUserId,
                reason,
            },
        });
        return { message: 'User blocked successfully' };
    }
    // 2.11 Unblock User
    async unblockUser(userId, blockedUserId) {
        const block = await prisma.userBlock.findUnique({
            where: {
                blockerId_blockedId: { blockerId: userId, blockedId: blockedUserId },
            },
        });
        if (!block) {
            throw new AppError('User is not blocked', 400);
        }
        await prisma.userBlock.delete({
            where: { id: block.id },
        });
        return { message: 'User unblocked successfully' };
    }
    // 2.12 Get Blocked Users List
    async getBlockedUsers(userId) {
        const blocks = await prisma.userBlock.findMany({
            where: { blockerId: userId },
            select: {
                id: true,
                reason: true,
                createdAt: true,
                blocked: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhotoUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return blocks.map(block => ({
            id: block.id,
            user: block.blocked,
            reason: block.reason,
            blockedAt: block.createdAt,
        }));
    }
    // Phone verification
    async sendPhoneOtp(userId, phoneNumber) {
        // Check if phone number is already in use
        const existingUser = await prisma.user.findFirst({
            where: { phoneNumber, id: { not: userId } },
        });
        if (existingUser) {
            throw new AppError('This phone number is already registered', 400);
        }
        // Rate limit (max 3 SMS per day)
        const rateLimitKey = `phone:ratelimit:${phoneNumber}`;
        const attempts = await redis.incr(rateLimitKey);
        if (attempts === 1) {
            await redis.expire(rateLimitKey, 24 * 60 * 60);
        }
        if (attempts > 3) {
            throw new AppError('Too many OTP requests. Try again tomorrow.', 429);
        }
        // Generate OTP
        const otp = generateOTP();
        await redis.setEx(REDIS_KEYS.OTP_PHONE(phoneNumber), REDIS_TTL.OTP, otp);
        // In production, send via SMS service (Twilio/AWS SNS)
        // For now, log it
        console.log(`📱 Phone OTP for ${phoneNumber}: ${otp}`);
        return { message: 'OTP sent to your phone number' };
    }
    async verifyPhoneOtp(userId, phoneNumber, otp) {
        const storedOtp = await redis.get(REDIS_KEYS.OTP_PHONE(phoneNumber));
        if (!storedOtp) {
            throw new AppError('OTP expired or not found. Please request a new one.', 400);
        }
        if (storedOtp !== otp) {
            throw new AppError('Invalid OTP', 400);
        }
        // Update user
        await prisma.user.update({
            where: { id: userId },
            data: {
                phoneNumber,
                phoneVerified: true,
                // Increase trust score by 0.2
                trustScore: { increment: 0.2 },
            },
        });
        // Delete OTP
        await redis.del(REDIS_KEYS.OTP_PHONE(phoneNumber));
        return { message: 'Phone number verified successfully' };
    }
    // Helper methods
    async getCancellationRate(userId) {
        const result = await prisma.$queryRaw `
      SELECT COALESCE(
        CASE 
          WHEN (total_completed + total_cancelled) = 0 THEN 0
          ELSE ROUND((total_cancelled::DECIMAL / (total_completed + total_cancelled)) * 100, 2)
        END, 0
      ) as rate
      FROM (
        SELECT 
          COUNT(*) FILTER (WHERE t.status = 'completed') as total_completed,
          COUNT(*) FILTER (WHERE m.status = 'cancelled') as total_cancelled
        FROM matches m
        JOIN trips t ON t.id = m.trip_id
        WHERE m.matched_user_id = ${userId}::uuid OR m.trip_creator_id = ${userId}::uuid
      ) stats
    `;
        return result[0]?.rate || 0;
    }
    async getAverageRating(userId) {
        const result = await prisma.review.aggregate({
            where: {
                reviewedUserId: userId,
                type: 'companion',
                isVerified: true,
            },
            _avg: { overallRating: true },
        });
        return result._avg.overallRating?.toNumber() || 5.0;
    }
}
export const userService = new UserService();
//# sourceMappingURL=user.service.js.map