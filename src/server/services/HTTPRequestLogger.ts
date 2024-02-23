/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AxiosError, AxiosResponse } from 'axios';
import { LoggingService } from './LoggingService';
import winston from 'winston';

export class HTTPRequestLogger {

    private static INSTANCE: HTTPRequestLogger;

    public static getInstance(): HTTPRequestLogger {
        if (!HTTPRequestLogger.INSTANCE) {
            HTTPRequestLogger.INSTANCE = new HTTPRequestLogger();
        }
        return HTTPRequestLogger.INSTANCE;
    }

    private constructor() {
        const logDirectory = LoggingService.createLogDirectory();

        try {
            this.createLogger(logDirectory);
        } catch (error) {
            console.error(error);
            console.error(error.stack);
        }
    }

    private logger: winston.Logger;

    private requests: Map<string, RequestEntry> = new Map();

    public start(method: string, resource: string, parameter: string): string {
        const entry = new RequestEntry(method, resource, parameter);
        this.requests.set(entry.id, entry);
        return entry.id;
    }

    public stop(id: string, response?: AxiosResponse | AxiosError): void {
        if (id && this.requests?.has(id)) {
            const entry = this.requests.get(id);

            const end = Date.now();
            const time = end - entry.startTime;

            const status = (response as AxiosResponse)?.status || (response as AxiosError).response?.status;

            this.logger.info(`${time}\t${entry.method}\t${status}\t${entry.resource}\t${entry.parameter}`);

            this.requests.delete(id);
        }
    }

    private createLogger(logDirectory?: string): void {
        const winstonLevels = {
            ERROR: 'error',
            WARNING: 'warn',
            INFO: 'info',
            DEBUG: 'debug',
        };

        this.logger = winston.createLogger({
            level: winstonLevels.INFO,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () => {
                        const date = new Date();
                        const year = date.getFullYear();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const day = date.getDate().toString().padStart(2, '0');

                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const seconds = date.getSeconds().toString().padStart(2, '0');

                        return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
                    }
                }),
                winston.format.printf((info) => {
                    const {
                        timestamp, level, message, ...args
                    } = info;

                    return `${timestamp}\t${level}\t${message}` +
                        `${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
                }),
            ),
            transports: [
                new (require('winston-daily-rotate-file'))({
                    level: winstonLevels.INFO,
                    name: 'default-file',
                    filename: logDirectory + '/http-request.log',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    maxSize: '100m',
                    prepend: true,
                    maxFiles: '20'
                })
            ]
        });
    }
}

class RequestEntry {

    public id: string;
    public startTime = Date.now();

    public constructor(
        public method: string,
        public resource: string,
        public parameter: string
    ) {
        this.id = `${Date.now()}-${method}-${resource}`;
        this.parameter = this.parameter.replace(new RegExp('"Content":".*=?(\\n)?"'), '"Content":"..."');
        this.parameter = this.parameter.replace(new RegExp('"Body":".*=?(\\n)?"'), '"Body":"..."');

        if (resource === 'clientregistrations' && method === 'POST') {
            this.parameter = '';
        }
    }

}