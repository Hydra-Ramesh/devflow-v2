import { AsyncLocalStorage } from 'async_hooks';

export const traceStorage = new AsyncLocalStorage<string>();

const logWithTrace = (level: string, ...args: any[]) => {
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
  info: (...args: any[]) => logWithTrace('info', ...args),
  error: (...args: any[]) => logWithTrace('error', ...args),
  warn: (...args: any[]) => logWithTrace('warn', ...args),
};

