import { Router } from 'express';
import { safetyController } from '../controllers/safety.controller.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// All safety routes require authentication
router.use(authenticate);
// Reports
router.post('/reports', safetyController.createReport);
router.get('/reports', safetyController.getMyReports);
// Block/Unblock users
router.post('/block', safetyController.blockUser);
router.delete('/block/:userId', safetyController.unblockUser);
router.get('/blocked', safetyController.getBlockedUsers);
// Emergency contacts
router.get('/emergency-contacts', safetyController.getEmergencyContacts);
router.post('/emergency-contacts', safetyController.addEmergencyContact);
router.put('/emergency-contacts/:contactId', safetyController.updateEmergencyContact);
router.delete('/emergency-contacts/:contactId', safetyController.deleteEmergencyContact);
// SOS
router.post('/sos', safetyController.triggerSOS);
export default router;
//# sourceMappingURL=safety.routes.js.map