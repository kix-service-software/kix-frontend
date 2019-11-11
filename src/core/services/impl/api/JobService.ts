/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, KIXObjectSpecificCreateOptions,
    Error, KIXObjectProperty
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { JobFactory } from '../../object-factories/JobFactory';
import { Job, JobProperty } from '../../../model/kix/job';
import { MacroFactory } from '../../object-factories/MacroFactory';
import { LoggingService } from '../LoggingService';
import { ExecPlanProperty, ExecPlanTypes } from '../../../model/kix/exec-plan';
import { MacroProperty, MacroAction } from '../../../model/kix/macro';
import { ExecPlanFactory } from '../../object-factories/ExecPlanFactory';
import { CreateMacroAction } from '../../../api/macro';
import { MacroActionTypeFactory } from '../../object-factories/MacroActionTypeFactory';

export class JobService extends KIXObjectService {

    private static INSTANCE: JobService;

    public static getInstance(): JobService {
        if (!JobService.INSTANCE) {
            JobService.INSTANCE = new JobService();
        }
        return JobService.INSTANCE;
    }

    private constructor() {
        super([new JobFactory(), new ExecPlanFactory(), new MacroFactory(), new MacroActionTypeFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'automation', 'jobs');
    protected RESOURCE_URI_ExecPlan: string = this.buildUri('system', 'automation', 'execplans');
    protected RESOURCE_URI_Macro: string = this.buildUri('system', 'automation', 'macros');
    protected RESOURCE_URI_MacroActionType: string = this.buildUri(
        'system', 'automation', 'macros', 'types', 'Ticket', 'actiontypes'
    );

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.JOB
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
        } else if (objectType === KIXObjectType.EXEC_PLAN) {
            objects = await super.load<Job>(
                token, KIXObjectType.EXEC_PLAN, this.RESOURCE_URI_ExecPlan, loadingOptions, objectIds, 'ExecPlan'
            );
        } else if (objectType === KIXObjectType.MACRO) {
            objects = await super.load<Job>(
                token, KIXObjectType.MACRO, this.RESOURCE_URI_Macro, loadingOptions, objectIds, 'Macro'
            );
        } else if (objectType === KIXObjectType.MACRO_ACTION_TYPE) {
            objects = await super.load<Job>(
                token, KIXObjectType.MACRO_ACTION_TYPE, this.RESOURCE_URI_MacroActionType, loadingOptions,
                objectIds, 'MacroActionType'
            );
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
                token, clientRequestId, parameter, this.RESOURCE_URI_ExecPlan, KIXObjectType.EXEC_PLAN,
                'ExecPlanID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        } else if (objectType === KIXObjectType.MACRO) {
            id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, this.RESOURCE_URI_Macro, KIXObjectType.MACRO,
                'MacroID', true
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

        const execPlanIds: number[] = await this.createExecPlansForJob(
            token, clientRequestId, parameter
        ).catch((error) => { throw new Error(error.Code, error.Message); });

        const macroId = await this.createMacroForJob(
            token, clientRequestId, parameter
        ).catch((error) => {
            this.deletePlansAndMacroOfJob(token, clientRequestId, execPlanIds);
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
            token, clientRequestId, jobParameter, this.RESOURCE_URI, KIXObjectType.JOB, 'JobID', true
        ).catch((error: Error) => {
            this.deletePlansAndMacroOfJob(token, clientRequestId, execPlanIds, macroId);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async createExecPlansForJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number[]> {
        const jobName = this.getParameterValue(parameter, JobProperty.NAME);
        const execPlanEvents: string[] = this.getParameterValue(parameter, JobProperty.EXEC_PLAN_EVENTS);
        const execPlanWeekdays: string[] = this.getParameterValue(parameter, JobProperty.EXEC_PLAN_WEEKDAYS);
        const execPlanTimes: string[] = this.getParameterValue(parameter, JobProperty.EXEC_PLAN_WEEKDAYS_TIMES);

        const execPlanIds: number[] = [];

        if (Array.isArray(execPlanEvents) && !!execPlanEvents.length) {
            const execPlanParameter: Array<[string, any]> = [
                [ExecPlanProperty.NAME, `Event based Execution Plan for Job "${jobName}"`],
                [ExecPlanProperty.TYPE, ExecPlanTypes.EVENT_BASED],
                [KIXObjectProperty.COMMENT, `Event based Execution Plan for Job "${jobName}"`],
                [ExecPlanProperty.PARAMETERS, { Event: execPlanEvents }]
            ];
            await this.createObject(
                token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanParameter
            ).then((response) => execPlanIds.push(response))
                .catch((error) => { throw new Error(error.Code, error.Message); });
        }

        if (
            Array.isArray(execPlanWeekdays) && !!execPlanWeekdays.length
            && Array.isArray(execPlanTimes) && !!execPlanTimes.length
        ) {
            const execPlanParameter: Array<[string, any]> = [
                [ExecPlanProperty.NAME, `Time based Execution Plan for Job "${jobName}"`],
                [ExecPlanProperty.TYPE, ExecPlanTypes.TIME_BASED],
                [KIXObjectProperty.COMMENT, `Time based Execution Plan for Job "${jobName}"`],
                [ExecPlanProperty.PARAMETERS, { Weekday: execPlanWeekdays, Time: execPlanTimes }]
            ];
            await this.createObject(
                token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanParameter
            ).then((response) => execPlanIds.push(response))
                .catch((error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    this.deletePlansAndMacroOfJob(token, clientRequestId, execPlanIds);
                    throw new Error(error.Code, error.Message);
                });
        }
        return execPlanIds;
    }

    public async createMacroForJob(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {
        const jobName = this.getParameterValue(parameter, JobProperty.NAME);
        const macroActions: MacroAction[] = this.getParameterValue(parameter, JobProperty.MACRO_ACTIONS);

        const createMacroActions: CreateMacroAction[] = Array.isArray(macroActions) ?
            macroActions.map(
                (ma) => new CreateMacroAction(
                    ma.Type, ma.Parameters, Number(ma.ValidID),
                    ma.Comment ? ma.Comment : `MacroAction for Job "${jobName}"`,
                )
            ) : [];

        let macroId;

        if (Array.isArray(macroActions) && !!macroActions.length) {
            const macroParameter: Array<[string, any]> = [
                [MacroProperty.NAME, `Macro for Job "${jobName}"`],
                [MacroProperty.TYPE, 'Ticket'],
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

    private prepareFilterParameter(jobParameter: Array<[string, any]>): void {
        const filterIndex = jobParameter.findIndex((p) => p[0] === JobProperty.FILTER);
        if (filterIndex !== -1 && Array.isArray(jobParameter[filterIndex][1])) {
            const filter = {};
            jobParameter[filterIndex][1].forEach((f) => {
                if (Array.isArray(f[1])) {
                    filter[f[0]] = f[1];
                } else if (typeof f[1] !== 'undefined' && f[1] !== null) {
                    f[1] = [f[1]];
                    filter[f[0]] = f[1];
                }
            });
            jobParameter[filterIndex][1] = filter;
        }
    }

    private deletePlansAndMacroOfJob(
        token: string, clientRequestId: string, execPlanIds: number[] = [], macroId?: number
    ): void {
        for (const execPlanId of execPlanIds) {
            if (execPlanId) {
                this.deleteObject(
                    token, clientRequestId, KIXObjectType.EXEC_PLAN, execPlanId,
                    undefined, KIXObjectType.EXEC_PLAN, this.RESOURCE_URI_ExecPlan
                ).catch((error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                });
            }
        }
        if (macroId) {
            this.deleteObject(
                token, clientRequestId, KIXObjectType.MACRO, macroId,
                undefined, KIXObjectType.MACRO, this.RESOURCE_URI_Macro
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            });
        }
    }

}
