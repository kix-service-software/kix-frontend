/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from './ConfigurationService';
import { LoggingService } from './LoggingService';
import { IServerConfiguration } from '../model/IServerConfiguration';
import { ServerUtil } from '../ServerUtil';


export class ProfilingService {

    private static INSTANCE: ProfilingService;

    public static getInstance(): ProfilingService {
        if (!ProfilingService.INSTANCE) {
            ProfilingService.INSTANCE = new ProfilingService();
        }
        return ProfilingService.INSTANCE;
    }

    private active: boolean;
    private tasks: ProfileTask[] = new Array<ProfileTask>();
    private messageCounter: Map<string, number> = new Map<string, number>();

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();

        this.active = serverConfig ? serverConfig.ENABLE_PROFILING || false : false;

        // deactivate in test mode
        if (ServerUtil.isTestMode()) {
            this.active = false;
        }
    }

    public start(category: string, message: string, inputData?: any): number {
        if (!this.active) {
            return -1;  // invalid task ID
        }

        let counter = this.messageCounter.get(message) | 0;
        const task = new ProfileTask(category, message, counter, inputData);
        this.tasks.push(task);
        this.messageCounter.set(message, ++counter);

        const taskId = this.tasks.length - 1;

        LoggingService.getInstance().debug(
            taskId
            + '\tStart'
            + '\t' + task.category + ''
            + '\t' + task.counter + ''
            + '\t' + task.inputDataSize + ' bytes'
            + '\t' + task.message
        );

        return taskId;
    }

    public stop(profileTaskId: number, outputData?: any): void {
        if (!this.active) {
            return;
        }

        // get given task object and stop profiling
        const task: ProfileTask = this.tasks[profileTaskId];
        task.stop(outputData);

        LoggingService.getInstance().debug(
            profileTaskId
            + '\tStop'
            + '\t' + task.duration + ' ms'
            + '\t' + task.outputDataSize + ' bytes'
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class ProfileTask {

    public startTime: number;
    public endTime: number;
    public duration: number;
    public inputDataSize: number = 0;
    public outputDataSize: number = 0;

    public constructor(public category: string, public message: string, public counter: number, inputData: any) {
        this.startTime = new Date().getTime();
        this.message = this.message.replace(new RegExp('"Content":".*="'), '"Content":"..."');
        if (inputData) {
            this.inputDataSize = JSON.stringify(inputData).length;
        }
    }

    public stop(outputData?: any): void {
        this.endTime = new Date().getTime();
        this.duration = this.endTime - this.startTime;
        if (outputData) {
            this.outputDataSize = JSON.stringify(outputData).length;
        }
    }
}
