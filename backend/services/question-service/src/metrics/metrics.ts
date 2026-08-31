import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({
  prefix: 'devflow_questions_',
  register,
});

export const questionCreatedCounter = new client.Counter({
  name: 'devflow_questions_created_total',
  help: 'Total number of questions created',
  registers: [register],
});

export const questionViewsCounter = new client.Counter({
  name: 'devflow_questions_views_total',
  help: 'Total number of question views served',
  registers: [register],
});

export const questionSearchCounter = new client.Counter({
  name: 'devflow_questions_search_total',
  help: 'Total number of search queries executed',
  registers: [register],
});
