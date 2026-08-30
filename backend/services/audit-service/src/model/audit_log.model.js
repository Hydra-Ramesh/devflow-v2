import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      default: 'GENERAL_EVENT',
      index: true,
    },
    service: {
      type: String,
      default: 'unknown-service',
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    correlationId: {
      type: String,
      default: 'N/A',
      index: true,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ service: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ topic: 1, timestamp: -1 });
auditLogSchema.index({ correlationId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
