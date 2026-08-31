import { AuditService } from '../services/audit.service.js';

export class AuditController {
  static async getLogs(req, res, next) {
    try {
      const {
        userId,
        service,
        action,
        topic,
        correlationId,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = req.query;

      const result = await AuditService.queryLogs({
        userId,
        service,
        action,
        topic,
        correlationId,
        startDate,
        endDate,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getUserLogs(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await AuditService.getUserAuditTrail(
        userId,
        parseInt(page, 10),
        parseInt(limit, 10)
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getStats(_req, res, next) {
    try {
      const stats = await AuditService.getStats();
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  }
}
