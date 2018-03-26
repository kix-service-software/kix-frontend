import { injectable, inject } from 'inversify';
import { validate, required } from '../decorators';
import { container } from '../Container';
import { IConfigurationService, ILoggingService, IProfilingService } from '@kix/core/dist/services';
import { LogLevel, IServerConfiguration } from '@kix/core/dist/common';


@injectable()
export class ProfilingService implements IProfilingService {

    private active: boolean;
    private tasks: ProfileTask[] = new Array<ProfileTask>();
    private messageCounter: Map<string, number> = new Map<string, number>();

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("ILoggingService") private loggingService: ILoggingService
    ) {
        const serverConfig: IServerConfiguration = configurationService.getServerConfiguration();

        this.active = serverConfig.ENABLE_PROFILING || false;

        // deactivate in test mode
        if (configurationService.isTestMode()) {
            this.active = false;
        }
    }

    @validate
    public start(@required category: string, @required message: string, inputData?: any): number {
        if (!this.active) {
            return -1;  // invalid task ID
        }

        let counter = this.messageCounter.get(message) | 0;
        this.tasks.push(new ProfileTask(category, message, counter, inputData));
        this.messageCounter.set(message, ++counter);
        return this.tasks.length - 1;
    }

    @validate
    public stop(@required profileTaskId: number, outputData?: any): void {
        if (!this.active) {
            return;
        }

        // get given task object and stop profiling
        const task: ProfileTask = this.tasks[profileTaskId];
        task.stop(outputData);

        this.loggingService.debug(
            'ProfilingTask(' + profileTaskId + '): '
            + '[' + task.category + '] '
            + task.message + ' ('
            + 'times called: ' + task.counter + ', '
            + 'duration: ' + task.duration + ' ms, '
            + 'in: ' + task.inputDataSize + ' bytes, '
            + 'out: ' + task.outputDataSize + ' bytes)');
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
