import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, requireVerified } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, updateInterestsSchema, addEmergencyContactSchema, updateEmergencyContactSchema, blockUserSchema, verifyPhoneSchema, verifyPhoneOtpSchema, } from '../validators/user.validator.js';
const router = Router();
// All routes require authentication
router.use(authenticate);
// 2.1 Get Own Profile
router.get('/me', userController.getOwnProfile.bind(userController));
// 2.9 Get User Statistics
router.get('/me/stats', userController.getUserStatistics.bind(userController));
// 2.3 Update Profile
router.patch('/me', validate(updateProfileSchema), userController.updateProfile.bind(userController));
// 2.5 Manage Interests
router.put('/me/interests', validate(updateInterestsSchema), userController.updateInterests.bind(userController));
// Emergency Contacts Routes
// 2.6 Add Emergency Contact
router.post('/me/emergency-contacts', validate(addEmergencyContactSchema), userController.addEmergencyContact.bind(userController));
// 2.7 Update Emergency Contact
router.patch('/me/emergency-contacts/:contactId', validate(updateEmergencyContactSchema), userController.updateEmergencyContact.bind(userController));
// 2.8 Delete Emergency Contact
router.delete('/me/emergency-contacts/:contactId', userController.deleteEmergencyContact.bind(userController));
// Phone Verification Routes
router.post('/me/phone/send-otp', requireVerified, validate(verifyPhoneSchema), userController.sendPhoneOtp.bind(userController));
router.post('/me/phone/verify', requireVerified, validate(verifyPhoneOtpSchema), userController.verifyPhoneOtp.bind(userController));
// 2.12 Get Blocked Users
router.get('/me/blocked', userController.getBlockedUsers.bind(userController));
// 2.2 Get Public Profile (must be after /me routes to avoid conflict)
router.get('/:userId', userController.getPublicProfile.bind(userController));
// 2.10 Block User
router.post('/:userId/block', validate(blockUserSchema), userController.blockUser.bind(userController));
// 2.11 Unblock User
router.delete('/:userId/block', userController.unblockUser.bind(userController));
export default router;
//# sourceMappingURL=user.routes.js.map