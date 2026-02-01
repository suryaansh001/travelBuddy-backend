import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';
const router = Router();
// All admin routes require authentication
// Note: Since no admin role exists in schema, these routes rely on 
// application-level admin verification (e.g., checking admin list in config)
router.use(authenticate);
// 10.2 Moderate User
router.post('/users/:userId/moderate', adminController.moderateUser);
// 10.3 Review Reports
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId', adminController.updateReportStatus);
// 10.4 Bulk Actions
router.post('/bulk-action', adminController.performBulkAction);
// 10.5 Content Moderation
router.get('/content', adminController.searchContent);
router.post('/content/:contentType/:contentId/moderate', adminController.moderateContent);
// 10.6 System Logs
router.get('/logs', adminController.getSystemLogs);
// 10.7 College Whitelist Management
router.get('/colleges', adminController.getCollegeWhitelist);
router.post('/colleges', adminController.addCollegeToWhitelist);
router.patch('/colleges/:collegeDomain', adminController.updateCollegeWhitelist);
router.delete('/colleges/:collegeDomain', adminController.removeCollegeFromWhitelist);
export default router;
//# sourceMappingURL=admin.routes.js.map