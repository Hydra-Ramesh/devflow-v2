import winston from 'winston';
import {env} from "../config/env.js";

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
                    const metaStr= Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
                })
            ),
        }),
    ],
});