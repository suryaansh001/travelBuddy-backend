import { matchService } from '../services/match.service.js';
import { acceptMatchSchema, rejectMatchSchema, cancelMatchSchema, getMyMatchesQuerySchema, getMatchDetailsSchema, } from '../validators/match.validator.js';
export class MatchController {
    // 4.6 Accept Match
    async acceptMatch(req, res, next) {
        try {
            const validated = acceptMatchSchema.parse({
                body: req.body,
                params: req.params,
            });
            const result = await matchService.acceptMatch(req.user.id, validated.params.matchId, validated.body.seatsRequested);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 4.7 Reject Match
    async rejectMatch(req, res, next) {
        try {
            const validated = rejectMatchSchema.parse({
                body: req.body,
                params: req.params,
            });
            const result = await matchService.rejectMatch(req.user.id, validated.params.matchId, validated.body?.reason);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 4.8 Cancel Match
    async cancelMatch(req, res, next) {
        try {
            const validated = cancelMatchSchema.parse({
                body: req.body,
                params: req.params,
            });
            const result = await matchService.cancelMatch(req.user.id, validated.params.matchId, validated.body?.reason);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get My Matches
    async getMyMatches(req, res, next) {
        try {
            const validated = getMyMatchesQuerySchema.parse({
                query: req.query,
            });
            const result = await matchService.getMyMatches(req.user.id, {
                status: validated.query.status,
                role: validated.query.role,
                page: validated.query.page,
                limit: validated.query.limit,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get Match Details
    async getMatchDetails(req, res, next) {
        try {
            const validated = getMatchDetailsSchema.parse({
                params: req.params,
            });
            const result = await matchService.getMatchDetails(req.user.id, validated.params.matchId);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get Pending Matches Count
    async getPendingCount(req, res, next) {
        try {
            const count = await matchService.getPendingMatchesCount(req.user.id);
            res.json({
                success: true,
                data: { count },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const matchController = new MatchController();
//# sourceMappingURL=match.controller.js.map