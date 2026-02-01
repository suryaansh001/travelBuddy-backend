import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserController {
  // 2.1 Get Own Profile
  async getOwnProfile(req: Request, res: Response) {
    const profile = await userService.getOwnProfile(req.user!.id);
    
    res.json({
      success: true,
      data: profile,
    });
  }

  // 2.2 Get Public Profile
  async getPublicProfile(req: Request, res: Response) {
    const userId = req.params.userId as string;
    
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
  async updateProfile(req: Request, res: Response) {
    const profile = await userService.updateProfile(req.user!.id, req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  }

  // 2.5 Update Interests
  async updateInterests(req: Request, res: Response) {
    const result = await userService.updateInterests(req.user!.id, req.body);
    
    res.json({
      success: true,
      message: 'Interests updated successfully',
      data: result,
    });
  }

  // 2.6 Add Emergency Contact
  async addEmergencyContact(req: Request, res: Response) {
    const contact = await userService.addEmergencyContact(req.user!.id, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: contact,
    });
  }

  // 2.7 Update Emergency Contact
  async updateEmergencyContact(req: Request, res: Response) {
    const contactId = req.params.contactId as string;
    
    if (!contactId) {
      throw new AppError('Contact ID is required', 400);
    }

    const contact = await userService.updateEmergencyContact(
      req.user!.id,
      contactId,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: contact,
    });
  }

  // 2.8 Delete Emergency Contact
  async deleteEmergencyContact(req: Request, res: Response) {
    const contactId = req.params.contactId as string;
    
    if (!contactId) {
      throw new AppError('Contact ID is required', 400);
    }

    const result = await userService.deleteEmergencyContact(req.user!.id, contactId);
    
    res.json({
      success: true,
      message: result.message,
    });
  }

  // 2.9 Get User Statistics
  async getUserStatistics(req: Request, res: Response) {
    const stats = await userService.getUserStatistics(req.user!.id);
    
    res.json({
      success: true,
      data: stats,
    });
  }

  // 2.10 Block User
  async blockUser(req: Request, res: Response) {
    const userId = req.params.userId as string;
    const { reason } = req.body;
    
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const result = await userService.blockUser(req.user!.id, userId, reason);
    
    res.json({
      success: true,
      message: result.message,
    });
  }

  // 2.11 Unblock User
  async unblockUser(req: Request, res: Response) {
    const userId = req.params.userId as string;
    
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const result = await userService.unblockUser(req.user!.id, userId);
    
    res.json({
      success: true,
      message: result.message,
    });
  }

  // 2.12 Get Blocked Users
  async getBlockedUsers(req: Request, res: Response) {
    const blockedUsers = await userService.getBlockedUsers(req.user!.id);
    
    res.json({
      success: true,
      data: blockedUsers,
    });
  }

  // Phone Verification
  async sendPhoneOtp(req: Request, res: Response) {
    const { phoneNumber } = req.body;
    const result = await userService.sendPhoneOtp(req.user!.id, phoneNumber);
    
    res.json({
      success: true,
      message: result.message,
    });
  }

  async verifyPhoneOtp(req: Request, res: Response) {
    const { phoneNumber, otp } = req.body;
    const result = await userService.verifyPhoneOtp(req.user!.id, phoneNumber, otp);
    
    res.json({
      success: true,
      message: result.message,
    });
  }
}

export const userController = new UserController();
