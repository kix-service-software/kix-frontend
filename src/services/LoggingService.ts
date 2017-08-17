import { injectable } from 'inversify';
import { ILoggingService } from './ILoggingService';
import { IServerConfiguration } from './../model/configuration/IServerConfiguration';
import { LogLevel } from './../model/logging/LogLevel';
import * as winston from 'winston';
import * as fs from 'fs';

@injectable()
export class LoggingService implements ILoggingService {

    private kixLogger: any;
    private defaultLevel: number;
    private logFileDir: string;
    private trace: boolean;
    private winstonLevels: string[] = [
        'error',
        'warn',
        'info',
        'error',
    ];

    public constructor() {

        const serverConfiguration: IServerConfiguration = require('../../server.config.json');

        this.defaultLevel = serverConfiguration.LOG_LEVEL || LogLevel.ERROR;

        this.logFileDir = serverConfiguration.LOG_FILEDIR || 'logs/';
        this.logFileDir = __dirname + '/../' + this.logFileDir.replace(/\/\w+\.log$/, '');

        // create log directory if necessary
        if (!fs.existsSync(this.logFileDir)) {
            fs.mkdirSync(this.logFileDir);
        }

        this.trace = serverConfiguration.LOG_TRACE || true;

        // create kix logger with comand line and file output
        this.kixLogger = new winston.Logger({
            level: this.winstonLevels[this.defaultLevel],
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
            this.kixLogger.add(winston.transports.File, {
                level: 'error',
                name: 'error-file',
                filename: this.logFileDir + '/kix-error.log',
                humanReadableUnhandledException: true,
                handleExceptions: true,
                json: false,
                // logstash: true
            });
        }
    }

    // TODO: @required message
    // log function for error
    public error(message, meta): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {
            console.log('error: ' + LogLevel.ERROR + ' --- ' + this.defaultLevel);

            // get stack trace
            if ( this.trace ) {
                if (!meta) {
                    meta = {};
                }

                meta.stackTrace = this.getStackTrace();

                // console.trace();

                // try {
                //     // Code throwing an exception
                // } catch(e) {
                //    console.log(e.stack);
                // }
            }

            // check if level is valid
            if (LogLevel.ERROR <= this.defaultLevel) {
                this.kixLogger.error(message, meta);
            }
        }
    }

    // TODO: @required message
    // log function for warning
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
    // log function for info
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
    // log function for debug
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

    // TODO: @required message
    // generic log function
    public log(level, message, meta): void {
        // TODO: if kann weg, wenn @required implementiert
        if (!message) {
            message = 'No log-message given!';
        } else {

            // check if level is valid
            if (level) {

                // get stack trace
                if ( level === 'error' && this.trace ) {
                    if (!meta) {
                        meta = {};
                    }
                    meta.stackTrace = this.getStackTrace();
                }

                const uLevel: string = level.toUpperCase();
                if (LogLevel[uLevel] <= this.defaultLevel) {
                    level = this.winstonLevels[LogLevel[uLevel]];
                    this.kixLogger.log(level, message, meta);
                }
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
