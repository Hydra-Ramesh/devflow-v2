import mongoose from 'mongoose';
import { AuditLog } from '../model/audit_log.model.js';
import { env } from '../config/env.js';

const DEMO_USERS = ['user-101', 'user-102', 'user-103', 'admin-1', 'user-205', 'user-309'];
const SERVICES = ['auth-service', 'user-service-v2', 'qa-service', 'gateway-service', 'notification-service'];

const SAMPLE_EVENTS = [
  {
    topic: 'user-registered',
    action: 'USER_REGISTERED',
    service: 'auth-service',
    userId: 'user-101',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    payload: { email: 'alice@example.com', role: 'USER', provider: 'LOCAL' },
    daysAgo: 5,
  },
  {
    topic: 'user-login',
    action: 'USER_LOGIN_SUCCESS',
    service: 'auth-service',
    userId: 'user-101',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    payload: { email: 'alice@example.com', authMethod: 'PASSWORD' },
    daysAgo: 4,
  },
  {
    topic: 'user-registered',
    action: 'USER_REGISTERED',
    service: 'auth-service',
    userId: 'user-102',
    ip: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payload: { email: 'bob@example.com', role: 'USER', provider: 'GITHUB' },
    daysAgo: 4,
  },
  {
    topic: 'audit-events',
    action: 'USER_PROFILE_UPDATED',
    service: 'user-service-v2',
    userId: 'user-101',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    payload: { updatedFields: ['bio', 'skills', 'location'], newLocation: 'San Francisco, CA' },
    daysAgo: 3,
  },
  {
    topic: 'question-created',
    action: 'QUESTION_CREATED',
    service: 'qa-service',
    userId: 'user-101',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    payload: { questionId: 'q-9021', title: 'How to optimize Kafka consumer group rebalances in Node.js?', tags: ['kafka', 'nodejs', 'microservices'] },
    daysAgo: 3,
  },
  {
    topic: 'answer-created',
    action: 'ANSWER_CREATED',
    service: 'qa-service',
    userId: 'user-102',
    ip: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payload: { questionId: 'q-9021', answerId: 'ans-4412', lengthChars: 850 },
    daysAgo: 2,
  },
  {
    topic: 'vote-cast',
    action: 'UPVOTE_ANSWER',
    service: 'qa-service',
    userId: 'user-103',
    ip: '198.51.100.88',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5)',
    payload: { targetType: 'ANSWER', targetId: 'ans-4412', voteValue: 1 },
    daysAgo: 2,
  },
  {
    topic: 'answer-accepted',
    action: 'ANSWER_ACCEPTED',
    service: 'qa-service',
    userId: 'user-101',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    payload: { questionId: 'q-9021', acceptedAnswerId: 'ans-4412', reputationAwarded: 15 },
    daysAgo: 1,
  },
  {
    topic: 'user-badge-unlocked',
    action: 'BADGE_UNLOCKED',
    service: 'user-service-v2',
    userId: 'user-102',
    ip: 'N/A',
    userAgent: 'System/EventBus',
    payload: { badgeId: 'badge-solution-hero', badgeName: 'Problem Solver Gold', points: 100 },
    daysAgo: 1,
  },
  {
    topic: 'role-changed',
    action: 'ROLE_MODIFIED',
    service: 'auth-service',
    userId: 'admin-1',
    ip: '10.0.0.1',
    userAgent: 'PostmanRuntime/7.36.0',
    payload: { targetUserId: 'user-102', previousRole: 'USER', newRole: 'MODERATOR', reason: 'High reputation contributions' },
    daysAgo: 0,
  },
  {
    topic: 'password-reset-requested',
    action: 'PASSWORD_RESET_REQUESTED',
    service: 'auth-service',
    userId: 'user-205',
    ip: '185.220.101.5',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    payload: { email: 'charlie@example.com', resetMethod: 'EMAIL_TOKEN' },
    daysAgo: 0,
  }
];

async function seed() {
  const uri = process.env.MONGO_URI || env.MONGO_URI || 'mongodb://mongodb:27017/audit-service';
  console.log(`Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri);

  const docs = SAMPLE_EVENTS.map((item, index) => {
    const timestamp = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000 - index * 3600 * 1000);
    return {
      eventId: `demo-evt-${1000 + index}`,
      topic: item.topic,
      action: item.action,
      service: item.service,
      userId: item.userId,
      correlationId: `corr-${Math.random().toString(36).substring(2, 9)}`,
      ip: item.ip,
      userAgent: item.userAgent,
      payload: item.payload,
      timestamp,
    };
  });

  const res = await AuditLog.insertMany(docs);
  console.log(`Successfully seeded ${res.length} realistic audit records.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Failed to seed:', err);
  process.exit(1);
});
