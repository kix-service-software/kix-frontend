/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable no-console */
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { ServerUtil } from '../ServerUtil';
import { ConfigurationService } from './ConfigurationService';
import { LogLevel } from '../model/LogLevel';
import { IServerConfiguration } from '../model/IServerConfiguration';
import { LogFile } from '../../frontend-applications/agent-portal/modules/system-log/model/LogFile';
import { LogTier } from '../../frontend-applications/agent-portal/modules/system-log/model/LogTier';
import { Attachment } from '../../frontend-applications/agent-portal/model/kix/Attachment';
import { rejects } from 'assert';


export class LoggingService {

    private static INSTANCE: LoggingService;

    public static getInstance(): LoggingService {
        if (!LoggingService.INSTANCE) {
            LoggingService.INSTANCE = new LoggingService();
        }
        return LoggingService.INSTANCE;
    }

    private defaultLevelNumber: number;
    private kixLogger: winston.Logger;
    private trace: boolean;
    private logFileDir: string;

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();

        const logFileDir = serverConfig?.LOG_FILEDIR || 'logs/';
        this.logFileDir = path.join(__dirname, '../../../', logFileDir.replace(/\/\w+\.log$/, ''));

        this.defaultLevelNumber = serverConfig.LOG_LEVEL || LogLevel.ERROR;

        this.trace = serverConfig.LOG_TRACE;

        // do not log in test mode
        if (!ServerUtil.isTestMode()) {
            const logDirectory = this.createLogDirectory(serverConfig);
            try {
                this.createLogger(logDirectory);
            } catch (error) {
                console.error(error);
                console.error(error.stack);
            }
        }

    }

    public error(message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.ERROR)) {
            if (this.kixLogger) {
                const winstonMeta = { ...meta };
                if (this.trace) {
                    winstonMeta.stackTrace = this.getStackTrace();
                }
                this.kixLogger.error(message, winstonMeta);
            } else {
                console.error(message);
            }
        }
    }

    public warning(message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.WARNING)) {
            if (this.kixLogger) {
                const winstonMeta = { ...meta };
                this.kixLogger.warn(message, winstonMeta);
            } else {
                console.warn(message);
            }
        }
    }

    public info(message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.INFO)) {
            if (this.kixLogger) {
                const winstonMeta = { ...meta };
                this.kixLogger.info(message, winstonMeta);
            } else {
                // tslint:disable-next-line: no-console
                console.log(message);
            }
        }
    }

    public debug(message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.DEBUG)) {
            if (this.kixLogger) {
                const winstonMeta = { ...meta };
                this.kixLogger.debug(message, winstonMeta);
            } else {
                // tslint:disable-next-line: no-console
                console.log(message);
            }
        }
    }

    public async getLogFiles(): Promise<LogFile[]> {
        const fileNames = fs.readdirSync(this.logFileDir);

        const logFiles: LogFile[] = [];
        for (const f of fileNames) {
            const logFile = await this.getLogFile(f);
            logFiles.push(logFile);
        }
        return logFiles;
    }

    public async getLogFile(
        logFileName: string, withContent?: boolean, tailCount?: number, logLevel: string[] = []
    ): Promise<LogFile> {
        const logFile = new LogFile();
        logFile.Filename = logFileName;
        logFile.DisplayName = logFileName;
        logFile.ID = logFileName;
        logFile.tier = LogTier.FRONTEND;

        const logFilePath = path.join(this.logFileDir, logFileName);
        const stats = fs.statSync(logFilePath);

        logFile.FilesizeRaw = stats.size;
        logFile.Filesize = Attachment.getHumanReadableContentSize(stats.size);
        logFile.ModifyTime = stats.mtime.toISOString();

        if (withContent) {
            if (tailCount) {
                let content = await this.tailLogFile(logFilePath, tailCount);
                if (logLevel && logLevel.length) {
                    content = content.filter((c) => logLevel.some((ll) => c.indexOf(ll) !== -1));
                }
                const stringContent = content.join('\n');
                logFile.Content = Buffer.from(stringContent).toString('base64');
            } else {
                logFile.Content = fs.readFileSync(logFilePath, { encoding: 'base64' });
            }
        }

        return logFile;
    }

    private async tailLogFile(logFilePath: string, tailCount: number): Promise<string[]> {
        const tailedContent = await new Promise<string[]>((resolve, reject) => {
            const content: string[] = [];
            const Tail = require('tail').Tail;
            const tailedFile = new Tail(logFilePath, { nLines: tailCount });
            tailedFile.on('line', (data: string) => {
                content.push(data);

                if (content.length === tailCount) {
                    tailedFile.unwatch();
                    resolve(content);
                }
            });

            tailedFile.on('error', function (error) {
                rejects(error);
            });
        }).catch((error): string[] => {
            LoggingService.getInstance().error(error);
            return [];
        });

        return tailedContent;
    }

    private createLogDirectory(serverConfig: IServerConfiguration): string {
        let logFileDir = serverConfig.LOG_FILEDIR || 'logs/';
        logFileDir = path.join(__dirname, '../../../', logFileDir.replace(/\/\w+\.log$/, ''));
        if (!fs.existsSync(logFileDir)) {
            try {
                fs.mkdirSync(logFileDir);
            } catch (error) {
                console.error('Could not create log directory');
            }
        }
        return logFileDir;
    }

    private createLogger(logDirectory?: string): void {
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
                                timestamp, level, message
                            } = info;

                            return `${timestamp} - ${level}: ${message}`;
                        }),
                    )
                }),
                new (require('winston-daily-rotate-file'))({
                    level: winstonLevels[LogLevel[this.defaultLevelNumber]],
                    name: 'default-file',
                    filename: logDirectory + '/kix.log',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    maxSize: '100m',
                    prepend: true,
                    maxFiles: '20'
                })
            ]
        });
    }

    private getStackTrace(): string {
        // return but remove first 4 lines
        // (with 'Error', this function and log function from this class and validate decorator function)
        return '\n' + new Error().stack.split('\n').slice(4).join('\n');
    }

    private checkLogLevel(level: LogLevel): boolean {
        if (!this.kixLogger) {
            return false;
        }

        return (level <= this.defaultLevelNumber);
    }
}
