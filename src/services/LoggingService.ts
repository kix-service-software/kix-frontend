import { injectable } from 'inversify';
import { validate, required } from '../decorators';
import { container } from '../Container';
import { IConfigurationService, ILoggingService } from './';
import { LogLevel, IServerConfiguration } from '../model';
import * as winston from 'winston';
import * as fs from 'fs';

@injectable()
export class LoggingService implements ILoggingService {

    private kixLogger: any;
    private defaultLevelNumber: number;
    private logFileDir: string;
    private trace: boolean;

    public constructor() {

        const configurationService = container.get<IConfigurationService>("IConfigurationService");
        const serverConfig: IServerConfiguration = configurationService.getServerConfiguration();

        this.defaultLevelNumber = serverConfig.LOG_LEVEL || LogLevel.ERROR;

        this.logFileDir = serverConfig.LOG_FILEDIR || 'logs/';
        this.logFileDir = __dirname + '/../' + this.logFileDir.replace(/\/\w+\.log$/, '');

        // create log directory if necessary
        if (!fs.existsSync(this.logFileDir)) {
            fs.mkdirSync(this.logFileDir);
        }

        this.trace = serverConfig.LOG_TRACE || true;

        const winstonLevels = {
            ERROR: 'error',
            WARNING: 'warn',
            INFO: 'info',
            DEBUG: 'debug',
        };
        // create kix logger with comand line and file output
        this.kixLogger = new winston.Logger({
            level: winstonLevels[LogLevel[this.defaultLevelNumber]],
            transports: [
                new winston.transports.Console({
                    timestamp: true,
                    colorize: true,
                    handleExceptions: true,
                    humanReadableUnhandledException: true
                }),
                new (require('winston-daily-rotate-file'))({
                    // new winston.transports.File({
                    name: 'default-file',
                    filename: this.logFileDir + '/kix.log',
                    // label: 'blablub123',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    maxsize: 100000000,
                    prepend: true
                })
            ]
        });

        // TODO: wenn error allein geloggt werden soll
        // add error if necessary
        const useError: boolean = true;
        if (useError) {
            this.kixLogger.add(require('winston-daily-rotate-file'), {
                level: 'error',
                name: 'error-file',
                filename: this.logFileDir + '/kix-error.log',
                humanReadableUnhandledException: true,
                handleExceptions: true,
                json: false,
                maxsize: 100000000,
                prepend: true
            });
        }
    }

    // TODO: @required message
    // log function for error
    @validate
    public error( @required message: string, meta?: any): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {

            // get stack trace
            if (this.trace) {
                if (!meta) {
                    meta = {};
                }

                meta.stackTrace = this.getStackTrace();
            }

            // check if level is valid
            if (LogLevel.ERROR <= this.defaultLevelNumber) {
                this.kixLogger.error(message, meta);
            }
        }
    }

    // TODO: @required message
    // log function for warning
    public warning( @required message: string, meta?: any): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {

            // check if level is valid
            if (LogLevel.WARNING <= this.defaultLevelNumber) {
                this.kixLogger.warn(message, meta);
            }
        }
    }

    // TODO: @required message
    // log function for info
    public info( @required message: string, meta?: any): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {

            // check if level is valid
            if (LogLevel.INFO <= this.defaultLevelNumber) {
                this.kixLogger.info(message, meta);
            }
        }
    }

    // TODO: @required message
    // log function for debug
    public debug( @required message: string, meta?: any): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {

            // check if level is valid
            if (LogLevel.DEBUG <= this.defaultLevelNumber) {
                this.kixLogger.debug(message, meta);
            }
        }
    }

    // function to get stack trace
    private getStackTrace() {
        const stack = new Error().stack;

        // return but remove first 3 lines (with "Error", this function and log function from this class)
        return '\n' + stack.substring(stack.indexOf("\n", stack.indexOf("\n", stack.indexOf("\n") + 1) + 1) + 1);
    }
}
