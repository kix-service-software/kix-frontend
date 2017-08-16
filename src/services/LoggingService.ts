import { ILoggingService } from './ILoggingService';
import { IServerConfiguration } from './../model/configuration/IServerConfiguration';
import { LogLevel } from './../model/logging/LogLevel';
import * as winston from 'winston';



export class LoggingService implements ILoggingService {

    private kixLogger: any;
    private defaultLevel: LogLevel;
    private logFile: string;
    private trace: boolean;

    public constructor() {

        const serverConfiguration: IServerConfiguration = require('../../server.config.json');
        this.defaultLevel = serverConfiguration.LOG_LEVEL || LogLevel.ERROR;
        this.logFile = serverConfiguration.LOG_FILE || 'dist/logs/kix.log';

        this.trace = serverConfiguration.LOG_TRACE || true;

        this.kixLogger = new winston.Logger({
            level: this.defaultLevel,
            transports: [
                new winston.transports.Console({
                    colorize: true,
                    timestamp: true
                }),
                // new (require('winston-daily-rotate-file'))({
                new winston.transports.File({
                    filename: this.logFile
                }),
            ]
        });

        // TODO: wenn error allein geloggt werden soll
        // add error if necessary
        if ( true ) {
            this.kixLogger.add(winston.transports.File, {
                name: 'error',
                filename: this.logFile.replace(/\/\w+\.log$/, '/kix-error.log'),
                level: 'error'
            });
        }
    }

    // TODO: @required message
    // error log function
    public error(message, meta): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {
            console.log('error: ' + LogLevel.ERROR + ' --- ' + this.defaultLevel);

            // check if level is valid
            if (LogLevel.ERROR <= this.defaultLevel) {
                this.kixLogger.error(message, meta);
            }
        }
    }

    // TODO: @required message
    // warning log function
    public warning(message, meta): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {
            console.log('warning: ' + LogLevel.WARNING + ' --- ' + this.defaultLevel);

            // check if level is valid
            if (LogLevel.WARNING <= this.defaultLevel) {
                this.kixLogger.warn(message, meta);
            }
        }
    }

    // TODO: @required message
    // info log function
    public info(message, meta): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {
            console.log('info: ' + LogLevel.INFO + ' --- ' + this.defaultLevel);

            // check if level is valid
            if (LogLevel.INFO <= this.defaultLevel) {
                this.kixLogger.info(message, meta);
            }
        }
    }

    // TODO: @required message
    // debug log function
    public debug(message, meta): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {
            console.log('debug: ' + LogLevel.DEBUG + ' --- ' + this.defaultLevel);
            // check if level is valid
            if (LogLevel.DEBUG <= this.defaultLevel) {
                this.kixLogger.debug(message, meta);
            }
        }
    }
}
