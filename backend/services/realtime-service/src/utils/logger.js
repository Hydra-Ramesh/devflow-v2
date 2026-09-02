import { AsyncLocalStorage } from 'async_hooks';

export const traceStorage = new AsyncLocalStorage();

const logWithTrace = (level, ...args) => {
  const traceId = traceStorage.getStore();
  const tracePrefix = traceId ? `[Trace: ${traceId}]` : '[Trace: NO-TRACE]';
  const timestamp = new Date().toISOString();
  
  if (level === 'error') {
    console.error(`[${timestamp}] [ERROR] ${tracePrefix}`, ...args);
  } else if (level === 'warn') {
    console.warn(`[${timestamp}] [WARN] ${tracePrefix}`, ...args);
  } else {
    console.log(`[${timestamp}] [INFO] ${tracePrefix}`, ...args);
  }
};

export const logger = {
  info: (...args) => logWithTrace('info', ...args),
  error: (...args) => logWithTrace('error', ...args),
  warn: (...args) => logWithTrace('warn', ...args),
};
