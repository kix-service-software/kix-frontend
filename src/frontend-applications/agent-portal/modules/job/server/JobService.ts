/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { Job } from '../model/Job';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { JobProperty } from '../model/JobProperty';
import { ExecPlan } from '../model/ExecPlan';
import { ExecPlanTypes } from '../model/ExecPlanTypes';
import { ExecPlanProperty } from '../model/ExecPlanProperty';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { Error } from '../../../../../server/model/Error';
import { JobType } from '../model/JobType';
import { JobRun } from '../model/JobRun';
import { IdService } from '../../../model/IdService';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { JobRunLog } from '../model/JobRunLog';
import { RunLogLoadingOptions } from '../model/RunLogLoadingOptions';
import { MacroAPIService } from '../../macro/server/MacroAPIService';

export class JobAPIService extends KIXObjectAPIService {

    private static INSTANCE: JobAPIService;

    public static getInstance(): JobAPIService {
        if (!JobAPIService.INSTANCE) {
            JobAPIService.INSTANCE = new JobAPIService();
        }
        return JobAPIService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'automation', 'jobs');
    protected RESOURCE_URI_JOB_TYPE: string = this.buildUri('system', 'automation', 'jobs', 'types');
    protected RESOURCE_URI_EXEC_PLAN: string = this.buildUri('system', 'automation', 'execplans');

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.JOB
            || kixObjectType === KIXObjectType.JOB_TYPE
            || kixObjectType === KIXObjectType.JOB_RUN
            || kixObjectType === KIXObjectType.JOB_RUN_LOG
            || kixObjectType === KIXObjectType.EXEC_PLAN;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.JOB) {
            objectResponse = await super.load<Job>(
                token, KIXObjectType.JOB, this.RESOURCE_URI, loadingOptions, objectIds, 'Job', clientRequestId, Job
            );
        } else if (objectType === KIXObjectType.JOB_TYPE) {
            objectResponse = await super.load<JobType>(
                token, KIXObjectType.JOB_TYPE, this.RESOURCE_URI_JOB_TYPE, loadingOptions,
                null, 'JobType', clientRequestId, JobType
            );
        } else if (objectType === KIXObjectType.JOB_RUN) {
            const uri = this.buildUri(
                this.RESOURCE_URI,
                objectLoadingOptions ? objectLoadingOptions.id : '',
                'runs'
            );
            objectResponse = await super.load<JobRun>(
                token, KIXObjectType.JOB_RUN, uri, loadingOptions,
                objectIds, 'JobRun', clientRequestId, JobRun
            );
        } else if (objectType === KIXObjectType.EXEC_PLAN) {
            objectResponse = await super.load<ExecPlan>(
                token, KIXObjectType.EXEC_PLAN, this.RESOURCE_URI_EXEC_PLAN, loadingOptions, objectIds, 'ExecPlan',
                clientRequestId, ExecPlan
            );
        } else if (objectType === KIXObjectType.JOB_RUN_LOG) {
            const runLogLoadingOptions = objectLoadingOptions as RunLogLoadingOptions;
            const jobId = runLogLoadingOptions?.jobId;
            const runId = runLogLoadingOptions?.runId;
            const uri = this.buildUri('system', 'automation', 'jobs', jobId, 'runs', runId, 'logs');
            objectResponse = await super.load<JobRunLog>(
                token, KIXObjectType.MACRO_TYPE, uri, null, null, 'JobRunLog', clientRequestId, JobRunLog
            );
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        let id;

        if (objectType === KIXObjectType.JOB) {
            id = this.createJob(token, clientRequestId, parameter).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        } else if (objectType === KIXObjectType.EXEC_PLAN) {
            id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, this.RESOURCE_URI_EXEC_PLAN, KIXObjectType.EXEC_PLAN,
                'ExecPlanID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        let id;

        if (objectType === KIXObjectType.JOB) {
            clientRequestId = parameter.some((p) => p[0] === JobProperty.EXEC && p[1])
                ? 'JobAPIService'
                : clientRequestId;
            id = await this.updateJob(token, clientRequestId, parameter, Number(objectId))
                .catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });
        } else if (objectType === KIXObjectType.EXEC_PLAN) {
            const uri = this.buildUri(this.RESOURCE_URI_EXEC_PLAN, objectId);
            id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, KIXObjectType.EXEC_PLAN, 'ExecPlanID'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return id;
    }

    private async createJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {

        const macroIds = await MacroAPIService.getInstance().createOrUpdateMacros(token, clientRequestId, parameter);

        const jobParameter = parameter.filter(
            (p) => p[0] !== JobProperty.EXEC_PLAN_EVENTS
                && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS
                && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS_TIMES
                && p[0] !== JobProperty.MACRO_ACTIONS
        );

        const execPlanIds: number[] = await this.createOrUpdateExecPlansForJob(
            token, clientRequestId, parameter
        ).catch((error) => { throw new Error(error.Code, error.Message); });

        if (execPlanIds.length) {
            jobParameter.push([JobProperty.EXEC_PLAN_IDS, execPlanIds]);
        }
        if (Array.isArray(macroIds)) {
            jobParameter.push([JobProperty.MACROS_IDS, macroIds]);
        }

        this.prepareFilterParameter(jobParameter);

        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, jobParameter, this.RESOURCE_URI, this.objectType, 'JobID', true
        ).catch((error: Error) => {
            this.deletePlansAndMacroOfNewJob(token, clientRequestId, execPlanIds);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    private async updateJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, jobId: number
    ): Promise<number> {
        if (jobId) {

            const macroIds = await MacroAPIService.getInstance().createOrUpdateMacros(
                token, clientRequestId, parameter, true
            );

            const jobParameter = parameter.filter(
                (p) => p[0] !== JobProperty.EXEC_PLAN_EVENTS
                    && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS
                    && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS_TIMES
                    && p[0] !== JobProperty.MACRO_ACTIONS
            );

            const execValue = parameter.find((p) => p[0] === JobProperty.EXEC);
            if (!execValue) {

                const loadingOptions = new KIXObjectLoadingOptions();
                loadingOptions.includes = [JobProperty.MACROS, JobProperty.EXEC_PLANS];
                const objectResponse = await super.load<Job>(
                    token, KIXObjectType.JOB, this.RESOURCE_URI, loadingOptions, [jobId], 'Job', clientRequestId, Job
                ).catch((error: Error) => {
                    throw new Error(error.Code, error.Message);
                });

                const jobs = objectResponse?.objects || [];
                if (jobs && !!jobs.length) {
                    await this.updateJobMacroRelations(token, clientRequestId, jobs[0], macroIds);

                    const execPlanIds: number[] = await this.createOrUpdateExecPlansForJob(
                        token, clientRequestId, parameter, jobs[0]
                    ).catch((error) => { throw new Error(error.Code, error.Message); });

                    this.prepareFilterParameter(jobParameter);

                    const uri = this.buildUri(this.RESOURCE_URI, jobId);
                    await super.executeUpdateOrCreateRequest(
                        token, clientRequestId, jobParameter, uri, this.objectType, 'JobID'
                    ).catch((error: Error) => {
                        // TODO: if new ExecPlans and/or Macro were created, delete them
                        // this.deletePlansAndMacroOfJob(token, clientRequestId, execPlanIds, macroId);
                        throw new Error(error.Code, error.Message);
                    });

                    await this.updateJobExecPlanRelations(token, clientRequestId, jobs[0], execPlanIds);
                }
            } else {
                const uri = this.buildUri(this.RESOURCE_URI, jobId);
                await super.executeUpdateOrCreateRequest(
                    token, clientRequestId, jobParameter, uri, this.objectType, 'JobID'
                ).catch((error: Error) => {
                    throw new Error(error.Code, error.Message);
                });
            }
        }

        return jobId;
    }

    private async createOrUpdateExecPlansForJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, job?: Job
    ): Promise<number[]> {
        const jobName = this.getParameterValue(parameter, JobProperty.NAME);
        const execPlanEvents: string[] = this.getParameterValue(parameter, JobProperty.EXEC_PLAN_EVENTS);
        const execPlanWeekdays: string[] = this.getParameterValue(parameter, JobProperty.EXEC_PLAN_WEEKDAYS);
        const execPlanTimes: string[] = this.getParameterValue(parameter, JobProperty.EXEC_PLAN_WEEKDAYS_TIMES);

        const execPlanIds: number[] = [];

        let eventExecPlans: ExecPlan[] = [];
        let timeExecPlans: ExecPlan[] = [];
        if (job) {
            eventExecPlans = job.ExecPlans.filter(
                (p) => p.Type === ExecPlanTypes.EVENT_BASED
            );
            timeExecPlans = job.ExecPlans.filter(
                (p) => p.Type === ExecPlanTypes.TIME_BASED
            );
        }

        await this.createOrUpdateEventBasedExecPlan(
            token, clientRequestId,
            execPlanEvents === null ? [] : execPlanEvents,
            jobName ? jobName : job ? Job.name : '',
            eventExecPlans.length ? eventExecPlans[0].ID : undefined
        ).then((response) => {
            if (response) { execPlanIds.push(response); }
        }).catch((error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        await this.createOrUpdateTimeBasedExecPlan(
            token, clientRequestId,
            execPlanWeekdays === null ? [] : execPlanWeekdays,
            execPlanTimes === null ? [] : execPlanTimes,
            jobName ? jobName : job ? Job.name : '',
            timeExecPlans.length ? timeExecPlans[0].ID : undefined
        ).then((response) => {
            if (response) { execPlanIds.push(response); }
        }).catch((error) => {
            this.deletePlansAndMacroOfNewJob(token, clientRequestId, execPlanIds);
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return execPlanIds;
    }

    private async createOrUpdateEventBasedExecPlan(
        token: string, clientRequestId: string, events: string[], jobName: string, existingId?: number
    ): Promise<number> {
        let id;
        if (Array.isArray(events)) {
            const execPlanParameter: Array<[string, any]> = [
                [ExecPlanProperty.NAME, IdService.generateDateBasedId('EventExecPlan-')],
                [ExecPlanProperty.TYPE, ExecPlanTypes.EVENT_BASED],
                [KIXObjectProperty.COMMENT, `Event based Execution Plan for Job "${jobName}"`],
                [ExecPlanProperty.PARAMETERS, { Event: events }]
            ];
            if (existingId) {
                id = await this.updateObject(
                    token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanParameter, existingId,
                    undefined, undefined
                ).catch((error) => { throw new Error(error.Code, error.Message); });
            } else {
                id = await this.createObject(
                    token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanParameter
                ).catch((error) => { throw new Error(error.Code, error.Message); });
            }
        }
        return id;
    }

    private async createOrUpdateTimeBasedExecPlan(
        token: string, clientRequestId: string, execPlanWeekdays: string[], execPlanTimes: string[],
        jobName: string, existingId?: number
    ): Promise<number> {
        let id;
        if (Array.isArray(execPlanWeekdays)) {
            const execPlanParameter: Array<[string, any]> = [
                [ExecPlanProperty.NAME, IdService.generateDateBasedId('TimeExecPlan-')],
                [ExecPlanProperty.TYPE, ExecPlanTypes.TIME_BASED],
                [KIXObjectProperty.COMMENT, `Time based Execution Plan for Job "${jobName}"`],
                [ExecPlanProperty.PARAMETERS, { Weekday: execPlanWeekdays, Time: execPlanTimes }]
            ];
            if (existingId) {
                id = await this.updateObject(
                    token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanParameter, existingId,
                    undefined, undefined
                ).catch((error) => { throw new Error(error.Code, error.Message); });
            } else {
                id = await this.createObject(
                    token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanParameter
                ).catch((error) => { throw new Error(error.Code, error.Message); });
            }
        }
        return id;
    }

    private prepareFilterParameter(jobParameter: Array<[string, any]>): void {
        const filterIndex = jobParameter.findIndex((p) => p[0] === JobProperty.FILTER);
        if (filterIndex !== -1 && Array.isArray(jobParameter[filterIndex][1])) {
            const filter = [];
            if (Array.isArray(jobParameter[filterIndex][1])) {
                jobParameter[filterIndex][1].forEach((jobFilter) => {
                    if (Array.isArray(jobFilter)) {
                        const andFilters = this.prepareObjectFilter(jobFilter);
                        filter.push(andFilters);
                    }
                });
            }

            jobParameter[filterIndex][1] = filter;
        }
    }

    private async updateJobExecPlanRelations(
        token: string, clientRequestId: string, job: Job, execPlanIds: number[] = []
    ): Promise<void> {
        let planIds: number[] = [];
        if (job && job.ExecPlans) {
            planIds = job.ExecPlans.map((p) => p.ID);
        }

        const newExePlanIds = execPlanIds.filter((newId) => !planIds.some((id) => newId === id));
        for (const planId of newExePlanIds) {
            const object = {};
            object['ExecPlanID'] = planId;
            const uri = this.buildUri(this.RESOURCE_URI, job.ID, 'execplanids');
            await this.sendRequest(
                token, clientRequestId, uri, object, KIXObjectType.JOB, true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            });
        }
    }

    private async updateJobMacroRelations(
        token: string, clientRequestId: string, job: Job, macroIds: number[] = []
    ): Promise<void> {
        let knownMacroIds: number[] = [];
        if (job && job.Macros) {
            knownMacroIds = job.Macros.map((p) => p.ID);
        }

        const newMacroIds = macroIds.filter((newId) => !knownMacroIds.some((id) => newId === id));
        for (const planId of newMacroIds) {
            const object = {};
            object['MacroID'] = planId;
            const uri = this.buildUri(this.RESOURCE_URI, job.ID, 'macroids');
            await this.sendRequest(
                token, clientRequestId, uri, object, KIXObjectType.JOB, true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            });
        }
    }

    private deletePlansAndMacroOfNewJob(
        token: string, clientRequestId: string, execPlanIds: number[] = [], macroIds: number[] = []
    ): void {
        for (const execPlanId of execPlanIds) {
            if (execPlanId) {
                this.deleteObject(
                    token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanId,
                    undefined, KIXObjectType.EXEC_PLAN, this.RESOURCE_URI_EXEC_PLAN
                ).catch((error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                });
            }
        }
        for (const macroId of macroIds) {
            MacroAPIService.getInstance().deleteMacro(token, macroId).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            });
        }
    }

}
