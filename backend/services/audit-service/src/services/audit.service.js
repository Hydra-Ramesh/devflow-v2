import { AuditLog } from '../model/audit_log.model.js';
import { auditQueriesCounter } from '../metrics/metrics.js';

export class AuditService {
  static async queryLogs({
    userId,
    service,
    action,
    topic,
    correlationId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  }) {
    auditQueriesCounter.inc();

    const query = {};

    if (userId) query.userId = userId;
    if (service) query.service = service;
    if (action) query.action = new RegExp(action, 'i');
    if (topic) query.topic = topic;
    if (correlationId && correlationId !== 'N/A') query.correlationId = correlationId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  static async getUserAuditTrail(userId, page = 1, limit = 50) {
    return this.queryLogs({ userId, page, limit });
  }

  static async getStats() {
    const [totalEvents, serviceBreakdown, topicBreakdown, recentActivity] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.aggregate([
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$topic', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.find().sort({ timestamp: -1 }).limit(10).lean(),
    ]);

    return {
      totalEvents,
      services: serviceBreakdown.map((s) => ({ service: s._id, count: s.count })),
      topics: topicBreakdown.map((t) => ({ topic: t._id, count: t.count })),
      recentActivity,
    };
  }
}
