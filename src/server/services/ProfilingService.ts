/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// eslint-disable-next-line max-classes-per-file
import { ConfigurationService } from './ConfigurationService';
import { IServerConfiguration } from '../model/IServerConfiguration';
import { ServerUtil } from '../ServerUtil';
import { RequestCounter } from './RequestCounter';
import winston from 'winston';
import { LoggingService } from './LoggingService';

export class ProfilingService {

    private static INSTANCE: ProfilingService;

    public static getInstance(): ProfilingService {
        if (!ProfilingService.INSTANCE) {
            ProfilingService.INSTANCE = new ProfilingService();
        }
        return ProfilingService.INSTANCE;
    }

    private active: boolean;
    private tasks: Map<number, ProfileTask> = new Map();
    private taskCounter: number = 0;

    private logger: winston.Logger;

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();

        this.active = serverConfig?.ENABLE_PROFILING;

        // deactivate in test mode
        if (ServerUtil.isTestMode()) {
            this.active = false;
        }

        if (this.active) {
            const logDirectory = LoggingService.createLogDirectory();

            try {
                this.createLogger(logDirectory);
            } catch (error) {
                console.error(error);
                console.error(error.stack);
            }
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

                        return `${day} - ${month} - ${year} ${hours}: ${minutes}: ${seconds}`;
                    }
                }),
                winston.format.printf((info) => {
                    const {
                        timestamp, level, message, ...args
                    } = info;

                    let params = Object.keys(args).length ? JSON.stringify(args, null, 2) : '';
                    params = params.replace((/[\t\n\r]/gm), '');
                    return `${timestamp}\t${level}\t${message}\t${params}`;
                }),
            ),
            transports: [
                new (require('winston-daily-rotate-file'))({
                    level: winstonLevels.INFO,
                    name: 'default-file',
                    filename: logDirectory + '/profile.log',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    maxSize: '100m',
                    prepend: true,
                    maxFiles: '20'
                })
            ]
        });
    }

    public start(category: string, message: string, inputData?: ProfilingData, logEntry: boolean = true): number {
        if (!this.active) {
            return null;  // invalid task ID
        }

        const task = new ProfileTask(++this.taskCounter, category, message, inputData);
        this.tasks.set(task.id, task);
        if (category === 'SocketIO') {
            RequestCounter.getInstance().incrementTotalSocketRequestCount();
        }

        if (logEntry) {
            this.logStart(task.id);
        }

        return task.id;
    }

    public logStart(taskId: number): void {
        const task = this.tasks.get(taskId);
        if (task) {
            this.logger.info(
                '[Profiling]'
                + '\t' + task.clientRequestId
                + '\t' + task.id
                + '\t' + Date.now()
                + '\tStart'
                + '\t' + task.category + ''
                + '\t' + RequestCounter.getInstance().getTotalSocketRequestCount() + ''
                + '\t' + RequestCounter.getInstance().getPendingSocketRequestCount() + ''
                + '\t' + RequestCounter.getInstance().getTotalHttpRequestCount() + ''
                + '\t' + RequestCounter.getInstance().getPendingHTTPRequestCount() + ''
                + '\t-'
                + '\t' + task.inputDataSize + ''
                + '\t' + task.message
            );
        }
    }

    public stop(profileTaskId: number, outputData?: ProfilingData): void {
        if (!this.active) {
            return;
        }

        // get given task object and stop profiling
        const task: ProfileTask = this.tasks.get(profileTaskId);
        if (task) {
            task.stop(outputData);
            this.tasks.delete(profileTaskId);

            this.logger.info(
                '[Profiling]'
                + '\t' + task.clientRequestId
                + '\t' + task.id
                + '\t' + Date.now()
                + '\tStop'
                + '\t' + task.category + ''
                + '\t' + RequestCounter.getInstance().getTotalSocketRequestCount() + ''
                + '\t' + RequestCounter.getInstance().getPendingSocketRequestCount() + ''
                + '\t' + RequestCounter.getInstance().getTotalHttpRequestCount() + ''
                + '\t' + RequestCounter.getInstance().getPendingHTTPRequestCount() + ''
                + '\t' + task.duration + ''
                + '\t' + task.outputDataSize + ''
                + '\t' + task.message
            );
        }
    }
}

// eslint-disable-next-line max-classes-per-file
class ProfileTask {

    public clientRequestId: string;
    public startTime: number;
    public endTime?: number;
    public duration?: number;
    public inputDataSize: number = 0;
    public outputDataSize: number = 0;

    public constructor(
        public id, public category: string, public message: string, inputData: ProfilingData
    ) {
        this.startTime = new Date().getTime();
        this.message = this.message.replace(new RegExp('"Content":".*=?(\\n)?"'), '"Content":"..."');
        this.message = this.message.replace(new RegExp('"Body":".*=?(\\n)?"'), '"Body":"..."');
        this.clientRequestId = '<none>';

        if (inputData) {
            this.clientRequestId = inputData.requestId ? inputData.requestId : this.clientRequestId;
            this.inputDataSize = JSON.stringify(inputData.data).length;
        }
    }

    public stop(outputData?: ProfilingData): void {
        this.endTime = new Date().getTime();
        this.duration = this.endTime - this.startTime;
        if (outputData) {
            this.outputDataSize = JSON.stringify(outputData.data).length;
        }
    }
}


interface ProfilingData {

    requestId?: string;
    data: Array<unknown>;

}