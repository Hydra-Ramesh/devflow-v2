import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({
  prefix: 'devflow_audit_',
  register,
});

export const auditEventsIngestedCounter = new client.Counter({
  name: 'devflow_audit_events_ingested_total',
  help: 'Total number of audit events consumed and saved to MongoDB',
  labelNames: ['topic', 'action'],
  registers: [register],
});

export const auditQueriesCounter = new client.Counter({
  name: 'devflow_audit_queries_total',
  help: 'Total number of audit log queries performed by administrators',
  registers: [register],
});
