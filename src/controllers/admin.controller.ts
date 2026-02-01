import type { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service.js';
import {
  moderateUserSchema,
  reviewReportsSchema,
  updateReportStatusSchema,
  bulkActionSchema,
  contentModerationSearchSchema,
  moderateContentSchema,
  systemLogsSchema,
  addCollegeWhitelistSchema,
  updateCollegeWhitelistSchema,
  collegeWhitelistQuerySchema,
} from '../validators/admin.validator.js';

// 10.2 Moderate User
export const moderateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const userId = req.params.userId as string;
    const data = moderateUserSchema.parse(req.body);
    const result = await adminService.moderateUser(adminId, userId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 10.3 Review Reports
export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = reviewReportsSchema.parse(req.query);
    const result = await adminService.getReports(params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Update Report Status
export const updateReportStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const reportId = req.params.reportId as string;
    const data = updateReportStatusSchema.parse(req.body);
    const result = await adminService.updateReportStatus(adminId, reportId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 10.4 Bulk Actions
export const performBulkAction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const data = bulkActionSchema.parse(req.body);
    const result = await adminService.performBulkAction(adminId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 10.5 Content Moderation - Search
export const searchContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = contentModerationSearchSchema.parse(req.query);
    const result = await adminService.searchContent(params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Moderate Content
export const moderateContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const contentType = req.params.contentType as string;
    const contentId = req.params.contentId as string;
    
    if (contentType !== 'trip' && contentType !== 'message') {
      res.status(400).json({ error: 'Invalid content type' });
      return;
    }
    
    const data = moderateContentSchema.parse(req.body);
    const result = await adminService.moderateContent(adminId, contentType, contentId, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 10.6 System Logs
export const getSystemLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = systemLogsSchema.parse(req.query);
    const result = await adminService.getSystemLogs(params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 10.7 College Whitelist Management
export const getCollegeWhitelist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = collegeWhitelistQuerySchema.parse(req.query);
    const result = await adminService.getCollegeWhitelist(params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addCollegeToWhitelist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const data = addCollegeWhitelistSchema.parse(req.body);
    const result = await adminService.addCollegeToWhitelist(adminId, data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateCollegeWhitelist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const collegeDomain = req.params.collegeDomain as string;
    const data = updateCollegeWhitelistSchema.parse(req.body);
    const result = await adminService.updateCollegeWhitelist(adminId, collegeDomain, data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeCollegeFromWhitelist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const collegeDomain = req.params.collegeDomain as string;
    const result = await adminService.removeCollegeFromWhitelist(adminId, collegeDomain);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
