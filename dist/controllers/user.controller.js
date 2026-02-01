import { userService } from '../services/user.service.js';
import { AppError } from '../middleware/errorHandler.js';
export class UserController {
    // 2.1 Get Own Profile
    async getOwnProfile(req, res) {
        const profile = await userService.getOwnProfile(req.user.id);
        res.json({
            success: true,
            data: profile,
        });
    }
    // 2.2 Get Public Profile
    async getPublicProfile(req, res) {
        const userId = req.params.userId;
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }
        const profile = await userService.getPublicProfile(userId, req.user?.id);
        res.json({
            success: true,
            data: profile,
        });
    }
    // 2.3 Update Profile
    async updateProfile(req, res) {
        const profile = await userService.updateProfile(req.user.id, req.body);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile,
        });
    }
    // 2.5 Update Interests
    async updateInterests(req, res) {
        const result = await userService.updateInterests(req.user.id, req.body);
        res.json({
            success: true,
            message: 'Interests updated successfully',
            data: result,
        });
    }
    // 2.6 Add Emergency Contact
    async addEmergencyContact(req, res) {
        const contact = await userService.addEmergencyContact(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Emergency contact added successfully',
            data: contact,
        });
    }
    // 2.7 Update Emergency Contact
    async updateEmergencyContact(req, res) {
        const contactId = req.params.contactId;
        if (!contactId) {
            throw new AppError('Contact ID is required', 400);
        }
        const contact = await userService.updateEmergencyContact(req.user.id, contactId, req.body);
        res.json({
            success: true,
            message: 'Emergency contact updated successfully',
            data: contact,
        });
    }
    // 2.8 Delete Emergency Contact
    async deleteEmergencyContact(req, res) {
        const contactId = req.params.contactId;
        if (!contactId) {
            throw new AppError('Contact ID is required', 400);
        }
        const result = await userService.deleteEmergencyContact(req.user.id, contactId);
        res.json({
            success: true,
            message: result.message,
        });
    }
    // 2.9 Get User Statistics
    async getUserStatistics(req, res) {
        const stats = await userService.getUserStatistics(req.user.id);
        res.json({
            success: true,
            data: stats,
        });
    }
    // 2.10 Block User
    async blockUser(req, res) {
        const userId = req.params.userId;
        const { reason } = req.body;
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }
        const result = await userService.blockUser(req.user.id, userId, reason);
        res.json({
            success: true,
            message: result.message,
        });
    }
    // 2.11 Unblock User
    async unblockUser(req, res) {
        const userId = req.params.userId;
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }
        const result = await userService.unblockUser(req.user.id, userId);
        res.json({
            success: true,
            message: result.message,
        });
    }
    // 2.12 Get Blocked Users
    async getBlockedUsers(req, res) {
        const blockedUsers = await userService.getBlockedUsers(req.user.id);
        res.json({
            success: true,
            data: blockedUsers,
        });
    }
    // Phone Verification
    async sendPhoneOtp(req, res) {
        const { phoneNumber } = req.body;
        const result = await userService.sendPhoneOtp(req.user.id, phoneNumber);
        res.json({
            success: true,
            message: result.message,
        });
    }
    async verifyPhoneOtp(req, res) {
        const { phoneNumber, otp } = req.body;
        const result = await userService.verifyPhoneOtp(req.user.id, phoneNumber, otp);
        res.json({
            success: true,
            message: result.message,
        });
    }
}
export const userController = new UserController();
//# sourceMappingURL=user.controller.js.map