import { injectable } from 'inversify';
import { validate, required } from '../decorators';
import { container } from '../Container';
import { IConfigurationService, ILoggingService } from './';
import { LogLevel, IServerConfiguration } from '../model';
import * as winston from 'winston';
import * as fs from 'fs';

@injectable()
export class LoggingService implements ILoggingService {

    private defaultLevelNumber: number;
    private kixLogger: any;
    private trace: boolean;

    public constructor() {

        const configurationService = container.get<IConfigurationService>("IConfigurationService");
        const serverConfig: IServerConfiguration = configurationService.getServerConfiguration();

        this.defaultLevelNumber = serverConfig.LOG_LEVEL || LogLevel.ERROR;

        this.trace = serverConfig.LOG_TRACE || true;

        // do not log in test mode
        if (configurationService.isTestMode()) {
            this.createLogger();
        } else {
            const logDirectory = this.createLogDirectory(serverConfig);
            this.createLogger(logDirectory);
        }

    }

    @validate
    public error( @required message: string, meta?: any): void {

        // get stack trace
        if (this.trace) {
            if (!meta) {
                meta = {};
            }

            meta.stackTrace = this.getStackTrace();
        }

        if (this.checkLogLevel(LogLevel.ERROR)) {
            this.kixLogger.error(message, meta);
        }
    }

    @validate
    public warning( @required message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.WARNING)) {
            this.kixLogger.warn(message, meta);
        }
    }

    @validate
    public info( @required message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.INFO)) {
            this.kixLogger.info(message, meta);
        }
    }

    @validate
    public debug( @required message: string, meta?: any): void {
        if (this.checkLogLevel(LogLevel.DEBUG)) {
            this.kixLogger.debug(message, meta);
        }
    }

    private createLogDirectory(serverConfig: IServerConfiguration): string {

        let logFileDir = serverConfig.LOG_FILEDIR || 'logs/';
        logFileDir = __dirname + '/../' + logFileDir.replace(/\/\w+\.log$/, '');
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

        if (!logDirectory) {

            // create empty kix logger (test mode)
            this.kixLogger = new winston.Logger({
                transports: []
            });
        } else {

            // create kix logger with comand line and file output
            this.kixLogger = new winston.Logger({
                level: winstonLevels[LogLevel[this.defaultLevelNumber]],
                transports: [
                    new winston.transports.Console({
                        timestamp: true,
                        colorize: true,
                        handleExceptions: true,
                        humanReadableUnhandledException: true,
                        silent: logDirectory ? false : true
                    }),
                    new (require('winston-daily-rotate-file'))({
                        level: winstonLevels[LogLevel[this.defaultLevelNumber]],
                        name: 'default-file',
                        filename: logDirectory + '/kix.log',
                        humanReadableUnhandledException: true,
                        handleExceptions: true,
                        maxsize: 100000000,
                        prepend: true,
                        timestamp: () => {
                            return new Date().toString();
                        }
                    })
                ]
            });

            // TODO: if error messages should also be in a single file
            // add error if necessary
            const useError: boolean = true;
            if (useError) {
                this.kixLogger.add((require('winston-daily-rotate-file')), {
                    level: 'error',
                    name: 'error-file',
                    filename: logDirectory + '/kix-error.log',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    json: false,
                    maxsize: 100000000,
                    prepend: true,
                    timestamp: () => {
                        return new Date().toString();
                    }
                });
            }
        }
    }

    private getStackTrace() {
        const stack = new Error().stack;

        // return but remove first 3 lines (with "Error", this function and log function from this class)
        return '\n' + stack.substring(stack.indexOf("\n", stack.indexOf("\n", stack.indexOf("\n") + 1) + 1) + 1);
    }

    private checkLogLevel(level: LogLevel): boolean {
        return (level <= this.defaultLevelNumber);
    }
}
