import winston from 'winston';
import {env} from "../config/env.js";
import { AsyncLocalStorage } from 'async_hooks';

export const traceStorage = new AsyncLocalStorage();

export const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'audit-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
                    const traceId = traceStorage.getStore() || 'NO-TRACE';
                    const metaStr= Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} [${service}] [Trace: ${traceId}] ${level}: ${message}${metaStr}`;
                })
            ),
        }),
    ],
});