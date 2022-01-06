/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// eslint-disable-next-line max-classes-per-file
import { ConfigurationService } from './ConfigurationService';
import { LoggingService } from './LoggingService';
import { IServerConfiguration } from '../model/IServerConfiguration';
import { ServerUtil } from '../ServerUtil';
import { IdService } from '../../frontend-applications/agent-portal/model/IdService';

export class ProfilingService {

    private static INSTANCE: ProfilingService;

    public static getInstance(): ProfilingService {
        if (!ProfilingService.INSTANCE) {
            ProfilingService.INSTANCE = new ProfilingService();
        }
        return ProfilingService.INSTANCE;
    }

    private active: boolean;
    private tasks: Map<string, ProfileTask> = new Map();
    private messageCounter: Map<string, number> = new Map<string, number>();

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();

        this.active = serverConfig ? serverConfig.ENABLE_PROFILING || false : false;

        // deactivate in test mode
        if (ServerUtil.isTestMode()) {
            this.active = false;
        }
    }

    public start(category: string, message: string, inputData?: ProfilingData): string {
        if (!this.active) {
            return null;  // invalid task ID
        }

        let counter = this.messageCounter.get(message) || 0;
        const task = new ProfileTask(category, message, counter, inputData);
        this.tasks.set(task.id, task);
        this.messageCounter.set(message, ++counter);

        LoggingService.getInstance().debug(
            '[Profiling]'
            + '\t' + task.requestId
            + '\t' + task.id
            + '\tStart'
            + '\t' + task.category + ''
            // TODO: currently disabled, replace with fixed version
            // + '\t' + SocketService.getInstance().getPendingRequestCount() + ''
            // + '\t' + HttpService.getInstance().getPendingRequestCount() + ''
            + '\t' + task.counter + ''
            + '\t' + task.inputDataSize + ' bytes'
            + '\t' + task.message
        );

        return task.id;
    }

    public stop(profileTaskId: string, outputData?: ProfilingData): void {
        if (!this.active) {
            return;
        }

        // get given task object and stop profiling
        const task: ProfileTask = this.tasks.get(profileTaskId);
        if (task) {
            task.stop(outputData);
            this.tasks.delete(profileTaskId);

            LoggingService.getInstance().debug(
                '[Profiling]'
                + '\t' + task.requestId
                + '\t' + profileTaskId
                + '\tStop'
                + '\t' + task.category + ''
                // TODO: currently disabled, replace with fixed version
                // + '\t' + SocketService.getInstance().getPendingRequestCount() + ''
                // + '\t' + HttpService.getInstance().getPendingRequestCount() + ''
                + '\t' + task.duration + ' ms'
                + '\t' + task.outputDataSize + ' bytes'
                + '\t' + task.message
            );
        }
    }
}

// eslint-disable-next-line max-classes-per-file
class ProfileTask {

    public id: string = IdService.generateDateBasedId();
    public requestId: string;
    public startTime: number;
    public endTime?: number;
    public duration?: number;
    public inputDataSize: number = 0;
    public outputDataSize: number = 0;

    public constructor(
        public category: string, public message: string, public counter: number, inputData: ProfilingData
    ) {
        this.startTime = new Date().getTime();
        this.message = this.message.replace(new RegExp('"Content":".*="'), '"Content":"..."');
        this.requestId = '<none>';
        if (inputData) {
            this.requestId = inputData.requestId ? inputData.requestId : this.requestId;
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