import { injectable, inject } from 'inversify';
import { validate, required } from '../decorators';
import { IConfigurationService, ILoggingService } from '@kix/core/dist/services';
import { LogLevel, IServerConfiguration } from '@kix/core/dist/common';
import winston = require('winston');
import path = require('path');
import fs = require('fs');


@injectable()
export class LoggingService implements ILoggingService {

    private defaultLevelNumber: number;
    private kixLogger: any;
    private trace: boolean;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService
    ) {
        const serverConfig: IServerConfiguration = configurationService.getServerConfiguration();

        this.defaultLevelNumber = serverConfig.LOG_LEVEL || LogLevel.ERROR;

        this.trace = serverConfig.LOG_TRACE || true;

        // do not log in test mode
        if (!configurationService.isTestMode()) {
            const logDirectory = this.createLogDirectory(serverConfig);
            this.createLogger(logDirectory);
        }

    }

    @validate
    public error(@required message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.ERROR)) {

            // get stack trace
            const winstonMeta = { ...meta };
            if (this.trace) {
                winstonMeta.stackTrace = this.getStackTrace();
            }
            this.kixLogger.error(message, winstonMeta);
        }
    }

    @validate
    public warning(@required message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.WARNING)) {
            const winstonMeta = { ...meta };
            this.kixLogger.warn(message, winstonMeta);
        }
    }

    @validate
    public info(@required message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.INFO)) {
            const winstonMeta = { ...meta };
            this.kixLogger.info(message, winstonMeta);
        }
    }

    @validate
    public debug(@required message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.DEBUG)) {
            const winstonMeta = { ...meta };
            this.kixLogger.debug(message, winstonMeta);
        }
    }

    private createLogDirectory(serverConfig: IServerConfiguration): string {
        let logFileDir = serverConfig.LOG_FILEDIR || 'logs/';
        logFileDir = path.join(__dirname, '..', logFileDir.replace(/\/\w+\.log$/, ''));
        if (!fs.existsSync(logFileDir)) {
            fs.mkdirSync(logFileDir);
        }
        return logFileDir;
    }

    private createLogger(logDirectory?: string) {
        const winstonLevels = {
            ERROR: 'error',
            WARNING: 'warn',
            INFO: 'info',
            DEBUG: 'debug',
        };

        // create kix logger with comand line and file output
        this.kixLogger = winston.createLogger({
            level: winstonLevels[LogLevel[this.defaultLevelNumber]],
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () => {
                        return new Date().toString();
                    }
                }),
                winston.format.printf((info) => {
                    const {
                        timestamp, level, message, ...args
                    } = info;

                    return `${timestamp} - ${level}: ${message} ` +
                        `${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
                }),
            ),
            transports: [
                new winston.transports.Console({
                    handleExceptions: true,
                    humanReadableUnhandledException: true,
                    prettyPrint: true,
                    silent: logDirectory ? false : true,
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.timestamp({
                            format: () => {
                                return new Date().toString();
                            }
                        }),
                        winston.format.printf((info) => {
                            const {
                                timestamp, level, message, ...args
                            } = info;

                            return `${timestamp} - ${level}: ${message} ` +
                                `${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
                        }),
                    )
                }),
                new (require('winston-daily-rotate-file'))({
                    level: winstonLevels[LogLevel[this.defaultLevelNumber]],
                    name: 'default-file',
                    filename: logDirectory + '/kix.log',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    maxsize: 100000000,
                    prepend: true
                }),
                new (require('winston-daily-rotate-file'))({
                    level: 'error',
                    name: 'error-file',
                    filename: logDirectory + '/kix-error.log',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    json: false,
                    maxsize: 100000000,
                    prepend: true
                })
            ]
        });
    }

    private getStackTrace() {
        // return but remove first 4 lines
        // (with "Error", this function and log function from this class and validate decorator function)
        return '\n' + new Error().stack.split('\n').slice(4).join('\n');
    }

    private checkLogLevel(level: LogLevel): boolean {
        if (!this.kixLogger) {
            return false;
        }

        return (level <= this.defaultLevelNumber);
    }
}
