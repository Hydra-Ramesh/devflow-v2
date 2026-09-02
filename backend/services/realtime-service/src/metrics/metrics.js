import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({
  prefix: 'devflow_realtime_',
  register,
});
