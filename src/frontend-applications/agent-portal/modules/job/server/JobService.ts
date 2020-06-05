/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { JobFactory } from './JobFactory';
import { JobTypeFactory } from './JobTypeFactory';
import { ExecPlanFactory } from './ExecPlanFactory';
import { MacroFactory } from './MacroFactory';
import { MacroActionTypeFactory } from './MacroActionTypeFactory';
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
import { MacroAction } from '../model/MacroAction';
import { CreateMacroAction } from './api/CreateMacroAction';
import { MacroProperty } from '../model/MacroProperty';
import { Macro } from '../model/Macro';
import { Error } from '../../../../../server/model/Error';
import { JobTypes } from '../model/JobTypes';
import { MacroActionType } from '../model/MacroActionType';
import { JobType } from '../model/JobType';
import { JobRunFactory } from './JobRunFactory';
import { JobRun } from '../model/JobRun';

export class JobAPIService extends KIXObjectAPIService {

    private static INSTANCE: JobAPIService;

    public static getInstance(): JobAPIService {
        if (!JobAPIService.INSTANCE) {
            JobAPIService.INSTANCE = new JobAPIService();
        }
        return JobAPIService.INSTANCE;
    }

    private constructor() {
        super([
            new JobFactory(), new JobTypeFactory(), new JobRunFactory(),
            new ExecPlanFactory(),
            new MacroFactory(), new MacroActionTypeFactory()
        ]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'automation', 'jobs');
    protected RESOURCE_URI_JOB_TYPE: string = this.buildUri('system', 'automation', 'jobs', 'types');
    protected RESOURCE_URI_EXEC_PLAN: string = this.buildUri('system', 'automation', 'execplans');
    protected RESOURCE_URI_MACRO: string = this.buildUri('system', 'automation', 'macros');

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.JOB
            || kixObjectType === KIXObjectType.JOB_TYPE
            || kixObjectType === KIXObjectType.JOB_RUN
            || kixObjectType === KIXObjectType.EXEC_PLAN
            || kixObjectType === KIXObjectType.MACRO
            || kixObjectType === KIXObjectType.MACRO_ACTION_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.JOB) {
            objects = await super.load<Job>(
                token, KIXObjectType.JOB, this.RESOURCE_URI, loadingOptions, objectIds, 'Job'
            );
        } else if (objectType === KIXObjectType.JOB_TYPE) {
            objects = await super.load<JobType>(
                token, KIXObjectType.JOB_TYPE, this.RESOURCE_URI_JOB_TYPE, loadingOptions,
                objectIds, 'JobType'
            );
        } else if (objectType === KIXObjectType.JOB_RUN) {
            const uri = this.buildUri(
                this.RESOURCE_URI,
                objectLoadingOptions ? objectLoadingOptions.id : '',
                'runs'
            );
            objects = await super.load<JobRun>(
                token, KIXObjectType.JOB_RUN, uri, loadingOptions,
                objectIds, 'JobRun'
            );
        } else if (objectType === KIXObjectType.EXEC_PLAN) {
            objects = await super.load<ExecPlan>(
                token, KIXObjectType.EXEC_PLAN, this.RESOURCE_URI_EXEC_PLAN, loadingOptions, objectIds, 'ExecPlan'
            );
        } else if (objectType === KIXObjectType.MACRO) {
            objects = await super.load<Macro>(
                token, KIXObjectType.MACRO, this.RESOURCE_URI_MACRO, loadingOptions, objectIds, 'Macro'
            );
        } else if (objectType === KIXObjectType.MACRO_ACTION_TYPE) {
            if (objectLoadingOptions) {
                const uri = this.buildUri(
                    'system', 'automation', 'macros', 'types',
                    objectLoadingOptions.id,
                    'actiontypes'
                );
                objects = await super.load<MacroActionType>(
                    token, KIXObjectType.MACRO_ACTION_TYPE, uri, loadingOptions, objectIds, 'MacroActionType'
                );
            }
        }

        return objects;
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
        } else if (objectType === KIXObjectType.MACRO) {
            id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, this.RESOURCE_URI_MACRO, KIXObjectType.MACRO,
                'MacroID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        let id;

        if (objectType === KIXObjectType.JOB) {
            id = this.updateJob(token, clientRequestId, parameter, Number(objectId)).catch((error: Error) => {
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
        } else if (objectType === KIXObjectType.MACRO) {
            const uri = this.buildUri(this.RESOURCE_URI_MACRO, objectId);
            id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, KIXObjectType.MACRO, 'MacroID'
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
        const jobParameter = parameter.filter(
            (p) => p[0] !== JobProperty.EXEC_PLAN_EVENTS
                && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS
                && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS_TIMES
                && p[0] !== JobProperty.MACRO_ACTIONS
        );

        const execPlanIds: number[] = await this.createOrUpdateExecPlansForJob(
            token, clientRequestId, parameter
        ).catch((error) => { throw new Error(error.Code, error.Message); });

        const macroId = await this.createMacroForJob(
            token, clientRequestId, parameter
        ).catch((error) => {
            this.deletePlansAndMacroOfNewJob(token, clientRequestId, execPlanIds);
            throw new Error(error.Code, error.Message);
        });

        if (!!execPlanIds.length) {
            jobParameter.push([JobProperty.EXEC_PLAN_IDS, execPlanIds]);
        }
        if (macroId) {
            jobParameter.push([JobProperty.MACROS_IDS, [macroId]]);
        }

        this.prepareFilterParameter(jobParameter);

        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, jobParameter, this.RESOURCE_URI, this.objectType, 'JobID', true
        ).catch((error: Error) => {
            this.deletePlansAndMacroOfNewJob(token, clientRequestId, execPlanIds, macroId);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    private async updateJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, jobId: number
    ): Promise<number> {
        if (jobId) {
            const jobParameter = parameter.filter(
                (p) => p[0] !== JobProperty.EXEC_PLAN_EVENTS
                    && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS
                    && p[0] !== JobProperty.EXEC_PLAN_WEEKDAYS_TIMES
                    && p[0] !== JobProperty.MACRO_ACTIONS
            );

            const execValue = parameter.find((p) => p[0] === JobProperty.EXEC);
            if (!execValue) {
                const loadingOptions = new KIXObjectLoadingOptions(undefined, undefined, 1, [
                    JobProperty.MACROS, JobProperty.EXEC_PLANS
                ]);
                const jobs = await super.load<Job>(
                    token, KIXObjectType.JOB, this.RESOURCE_URI, loadingOptions, [jobId], 'Job'
                ).catch((error: Error) => {
                    throw new Error(error.Code, error.Message);
                });
                if (jobs && !!jobs.length) {
                    const execPlanIds: number[] = await this.createOrUpdateExecPlansForJob(
                        token, clientRequestId, parameter, jobs[0]
                    ).catch((error) => { throw new Error(error.Code, error.Message); });

                    const macroId = await this.updateMacroForJob(
                        token, clientRequestId, parameter, jobs[0]
                    ).catch((error) => {
                        // TODO: if new ExecPlans were created, delete them
                        // this.deletePlansAndMacroOfJob(token, clientRequestId, execPlanIds);
                        throw new Error(error.Code, error.Message);
                    });

                    this.prepareFilterParameter(jobParameter);

                    const uri = this.buildUri(this.RESOURCE_URI, jobId);
                    await super.executeUpdateOrCreateRequest(
                        token, clientRequestId, jobParameter, uri, this.objectType, 'JobID'
                    ).catch((error: Error) => {
                        // TODO: if new ExecPlans and/or Macro were created, delete them
                        // this.deletePlansAndMacroOfJob(token, clientRequestId, execPlanIds, macroId);
                        throw new Error(error.Code, error.Message);
                    });

                    await this.updateJobRelations(token, clientRequestId, jobs[0], execPlanIds, macroId);
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
            !!eventExecPlans.length ? eventExecPlans[0].ID : undefined
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
            !!timeExecPlans.length ? timeExecPlans[0].ID : undefined
        ).then((response) => {
            if (response) { execPlanIds.push(response); }
        }).catch((error) => {
            if (job) {
                this.deletePlansAndMacroOfNewJob(token, clientRequestId, execPlanIds);
            }
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
                [ExecPlanProperty.NAME, `Event based Execution Plan for Job "${jobName}"`],
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
                [ExecPlanProperty.NAME, `Time based Execution Plan for Job "${jobName}"`],
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

    private async createMacroForJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {
        const jobName = this.getParameterValue(parameter, JobProperty.NAME);
        const jobType = this.getParameterValue(parameter, JobProperty.TYPE);
        const macroActions: MacroAction[] = this.getParameterValue(parameter, JobProperty.MACRO_ACTIONS);

        const createMacroActions: CreateMacroAction[] = Array.isArray(macroActions) ?
            macroActions.map(
                (ma) => new CreateMacroAction(
                    ma.Type, ma.Parameters, Number(ma.ValidID),
                    ma.Comment ? ma.Comment : `MacroAction for Job "${jobName}"`,
                )
            ) : macroActions === null ? [] : undefined;

        let macroId;

        if (Array.isArray(createMacroActions)) {
            const macroParameter: Array<[string, any]> = [
                [MacroProperty.NAME, `Macro for Job "${jobName}"`],
                [MacroProperty.TYPE, jobType || JobTypes.TICKET],
                [KIXObjectProperty.COMMENT, `Macro for Job "${jobName}"`],
                [MacroProperty.ACTIONS, createMacroActions]
            ];
            macroId = await this.createObject(
                token, clientRequestId, KIXObjectType.MACRO, macroParameter
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return macroId;
    }
    private async updateMacroForJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, job: Job
    ): Promise<number> {
        let id;
        if (job) {
            let newJobName = this.getParameterValue(parameter, JobProperty.NAME);
            if (!newJobName) {
                newJobName = Job.name;
            }

            const macroActions: MacroAction[] = this.getParameterValue(parameter, JobProperty.MACRO_ACTIONS);

            const createMacroActions: CreateMacroAction[] = Array.isArray(macroActions) ?
                macroActions.map(
                    (ma) => new CreateMacroAction(
                        ma.Type, ma.Parameters, Number(ma.ValidID),
                        ma.Comment ? ma.Comment : `MacroAction for Job "${newJobName}"`,
                    )
                ) : [];

            if (Array.isArray(createMacroActions)) {
                const jobMacro = job.Macros && !!job.Macros.length ? job.Macros[0] : null;
                const macroParameter: Array<[string, any]> = [
                    [MacroProperty.NAME, `Macro for Job "${newJobName}"`],
                    [MacroProperty.TYPE, jobMacro.Type],
                    [KIXObjectProperty.COMMENT, `Macro for Job "${newJobName}"`]
                ];
                if (jobMacro) {
                    const actionIds = await this.updateMacroActions(
                        token, clientRequestId, jobMacro, createMacroActions
                    ).catch((error) => {
                        LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                        throw new Error(error.Code, error.Message);
                    });
                    macroParameter.push([MacroProperty.EXEC_ORDER, actionIds]);
                    id = await this.updateObject(
                        token, clientRequestId, KIXObjectType.MACRO, macroParameter, jobMacro.ID,
                        undefined, undefined
                    ).catch((error) => { throw new Error(error.Code, error.Message); });
                } else {
                    macroParameter.push([MacroProperty.ACTIONS, createMacroActions]);
                    id = await this.createObject(
                        token, clientRequestId, KIXObjectType.MACRO, macroParameter
                    ).catch((error) => {
                        LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                        throw new Error(error.Code, error.Message);
                    });
                }
            }
        }

        return id;
    }

    private async updateMacroActions(
        token: string, clientRequestId: string, macro: Macro, newActions: CreateMacroAction[]
    ): Promise<number[]> {
        const actionIds = macro.Actions.map((a) => a.ID);
        const uri = this.buildUri(this.RESOURCE_URI_MACRO, macro.ID, 'actions');

        // TODO: just delete unnecessary action and update/create other actions
        if (actionIds && !!actionIds.length) {
            await this.deleteObject(
                token, clientRequestId, KIXObjectType.MACRO_ACTION, actionIds.join(','),
                undefined, KIXObjectType.EXEC_PLAN, uri
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            });
        }

        const newActionIds: number[] = [];
        for (const action of newActions) {
            const object = {};
            object[KIXObjectType.MACRO_ACTION] = action;
            await this.sendRequest(
                token, clientRequestId, uri, object, KIXObjectType.MACRO_ACTION, true
            ).then((response) => {
                if (response) {
                    newActionIds.push(response.MacroActionID);
                }
            }).catch((error: Error) => {
                throw new Error(error.Code, error.Message);
            });
        }

        return newActionIds;
    }

    private prepareFilterParameter(jobParameter: Array<[string, any]>): void {
        const filterIndex = jobParameter.findIndex((p) => p[0] === JobProperty.FILTER);
        if (filterIndex !== -1 && typeof jobParameter[filterIndex][1] === 'object') {
            const filter = {};
            for (const property in jobParameter[filterIndex][1]) {
                if (property) {
                    if (Array.isArray(jobParameter[filterIndex][1][property])) {
                        filter[property] = jobParameter[filterIndex][1][property];
                    } else if (
                        typeof jobParameter[filterIndex][1][property] !== 'undefined'
                        && jobParameter[filterIndex][1][property] !== null
                    ) {
                        filter[property] = [jobParameter[filterIndex][1][property]];
                    }
                }
            }
            jobParameter[filterIndex][1] = filter;
        }
    }

    private deletePlansAndMacroOfNewJob(
        token: string, clientRequestId: string, execPlanIds: number[] = [], macroId?: number
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
        if (macroId) {
            this.deleteObject(
                token, clientRequestId, KIXObjectType.MACRO, macroId,
                undefined, KIXObjectType.MACRO, this.RESOURCE_URI_MACRO
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            });
        }
    }

    private async updateJobRelations(
        token: string, clientRequestId: string, job: Job, execPlanIds: number[] = [], macroId: number
    ): Promise<void> {
        let planIds: number[] = [];
        if (job && job.ExecPlans) {
            planIds = job.ExecPlans.map((p) => p.ID);
        }

        let macroIds: number[] = [];
        if (job && job.Macros) {
            macroIds = job.Macros.map((p) => p.ID);
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

        if (macroId && !macroIds.some((id) => macroId === id)) {
            const object = {};
            object['MacroID'] = macroId;
            const uri = this.buildUri(this.RESOURCE_URI, job.ID, 'macroids');
            await this.sendRequest(
                token, clientRequestId, uri, object, KIXObjectType.JOB, true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            });
        }
    }
}
