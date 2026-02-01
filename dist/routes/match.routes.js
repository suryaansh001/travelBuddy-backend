import { Router } from 'express';
import { matchController } from '../controllers/match.controller.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// All match routes require authentication
router.use(authenticate);
// Get My Matches
router.get('/', matchController.getMyMatches.bind(matchController));
// Get Pending Matches Count
router.get('/pending/count', matchController.getPendingCount.bind(matchController));
// Get Match Details
router.get('/:matchId', matchController.getMatchDetails.bind(matchController));
// 4.6 Accept Match
router.post('/:matchId/accept', matchController.acceptMatch.bind(matchController));
// 4.7 Reject Match
router.post('/:matchId/reject', matchController.rejectMatch.bind(matchController));
// 4.8 Cancel Match
router.post('/:matchId/cancel', matchController.cancelMatch.bind(matchController));
export default router;
//# sourceMappingURL=match.routes.js.map