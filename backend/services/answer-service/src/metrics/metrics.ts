import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({
  prefix: 'devflow_answers_',
  register,
});

