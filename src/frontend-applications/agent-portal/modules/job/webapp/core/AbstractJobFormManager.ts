/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { JobService } from '.';
import { DefaultSelectInputFormOption } from '../../../../model/configuration/DefaultSelectInputFormOption';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ExecPlan } from '../../model/ExecPlan';
import { ExecPlanTypes } from '../../model/ExecPlanTypes';
import { Job } from '../../model/Job';
import { JobProperty } from '../../model/JobProperty';
import { Macro } from '../../model/Macro';
import { ExtendedJobFormManager } from './ExtendedJobFormManager';
import { MacroFieldCreator } from './MacroFieldCreator';

export class AbstractJobFormManager {

    public filterManager: AbstractDynamicFormManager;

    public extendedJobFormManager: ExtendedJobFormManager[] = [];

    public job: Job = null;
    protected execPageId: string = 'job-form-page-execution-plan';
    protected filterPageId: string = 'job-form-page-filters';
    protected actionPageId: string = 'job-form-page-actions';

    public addExtendedJobFormManager(manager: ExtendedJobFormManager): void {
        this.extendedJobFormManager.push(manager);
    }

    public reset(): void {
        if (this.filterManager) {
            this.filterManager.reset();
        }
    }

    public supportFilter(): boolean {
        return true;
    }

    public supportPlan(planType: ExecPlanTypes): boolean {
        return true;
    }

    public async getPages(job: Job, formInstance: FormInstance): Promise<FormPageConfiguration[]> {
        const execPlanPage = await this.getExecPlanPage(formInstance);
        const filterPage = await this.getFilterPage(formInstance);
        const actionPage = await this.getMacroPage(job, formInstance);
        return [execPlanPage, filterPage, actionPage];
    }

    public static getJobPage(formInstance: FormInstance): FormPageConfiguration {
        return new FormPageConfiguration(
            'job-new-form-page-information', 'Translatable#Job Information',
            [], true, null,
            [
                new FormGroupConfiguration(
                    'job-new-form-group-information', 'Translatable#Job Information',
                    [], null,
                    [
                        new FormFieldConfiguration(
                            'job-new-form-field-type',
                            'Translatable#Type of Job', JobProperty.TYPE,
                            'object-reference-input', true, 'Translatable#Helptext_Admin_JobCreateEdit_Type',
                            [
                                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.JOB_TYPE),
                                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true)
                            ], null, null, null, null, null, null, null, null, null, null, null, null,
                            formInstance?.getFormContext() === FormContext.EDIT
                        ),
                        new FormFieldConfiguration(
                            'job-new-form-field-name',
                            'Translatable#Name', JobProperty.NAME, null, true,
                            'Translatable#Helptext_Admin_JobCreateEdit_Name'
                        ),
                        new FormFieldConfiguration(
                            'job-new-form-field-comment',
                            'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                            'Translatable#Helptext_Admin_JobCreateEdit_Comment', null, null, null,
                            null, null, null, null, null, 250
                        ),
                        new FormFieldConfiguration(
                            'job-new-form-field-valid',
                            'Translatable#Validity', KIXObjectProperty.VALID_ID,
                            'object-reference-input', true, 'Translatable#Helptext_Admin_JobCreateEdit_Validity',
                            [
                                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                            ], new FormFieldValue(1)
                        )
                    ]
                )
            ]
        );
    }

    protected async getExecPlanPage(forminstance: FormInstance): Promise<FormPageConfiguration> {
        const timeGroup = await this.getTimeGroup(forminstance?.getFormContext());
        const eventGroup = await this.getEventGroup(forminstance?.getFormContext());
        return new FormPageConfiguration(
            this.execPageId, 'Translatable#Execution Plan',
            undefined, undefined, undefined, [timeGroup, eventGroup]
        );
    }

    protected async getTimeGroup(formContext: FormContext): Promise<FormGroupConfiguration> {
        const weekdaysValue = await this.getValue(JobProperty.EXEC_PLAN_WEEKDAYS, null, null, this.job, formContext);
        const weekdays = new FormFieldConfiguration(
            'job-form-field-weekdays',
            'Translatable#Weekday(s)', JobProperty.EXEC_PLAN_WEEKDAYS, 'default-select-input', false,
            'Translatable#Helptext_Admin_JobCreateEdit_Days',
            [
                new FormFieldOption(
                    DefaultSelectInputFormOption.NODES,
                    [
                        new TreeNode('Mon', 'Translatable#Monday'),
                        new TreeNode('Tue', 'Translatable#Tuesday'),
                        new TreeNode('Wed', 'Translatable#Wednesday'),
                        new TreeNode('Thu', 'Translatable#Thursday'),
                        new TreeNode('Fri', 'Translatable#Friday'),
                        new TreeNode('Sat', 'Translatable#Saturday'),
                        new TreeNode('Sun', 'Translatable#Sunday')
                    ]
                ),
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
            ], weekdaysValue ? new FormFieldValue(weekdaysValue) : undefined
        );

        const timeNodes = [];
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            for (let j = 0; j < 60; j += 5) {
                const minute = j.toString().padStart(2, '0');
                const time = `${hour}:${minute}`;
                const id = `${time}:00`;
                const node = new TreeNode(id, time);
                timeNodes.push(node);
            }
        }

        const timesValue = await this.getValue(JobProperty.EXEC_PLAN_WEEKDAYS_TIMES, null, null, this.job, formContext);
        const times = new FormFieldConfiguration(
            'job-form-field-times',
            'Translatable#Time', JobProperty.EXEC_PLAN_WEEKDAYS_TIMES, 'default-select-input', false,
            'Translatable#Helptext_Admin_JobCreateEdit_Time',
            [
                new FormFieldOption(DefaultSelectInputFormOption.NODES, timeNodes),
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
            ], timesValue ? new FormFieldValue(timesValue) : undefined
        );

        return new FormGroupConfiguration(
            'job-form-group-time_based', 'Translatable#Time Based Execution',
            undefined, undefined, [weekdays, times]
        );
    }

    protected async getEventGroup(formContext: FormContext): Promise<FormGroupConfiguration> {
        const eventsValue = await this.getValue(JobProperty.EXEC_PLAN_EVENTS, null, null, this.job, formContext);
        const events = new FormFieldConfiguration(
            'job-form-field-events', 'Translatable#Events', JobProperty.EXEC_PLAN_EVENTS,
            'job-input-events', false, 'Translatable#Helptext_Admin_JobCreateEdit_Events',
            undefined, eventsValue ? new FormFieldValue(eventsValue) : undefined
        );
        return new FormGroupConfiguration(
            'job-form-group-event_based', 'Translatable#Event Based Execution',
            undefined, undefined, [events]
        );
    }

    protected async getFilterPage(formInstance: FormInstance): Promise<FormPageConfiguration> {
        const filtersValue = await this.getValue(
            JobProperty.FILTER, null, null, this.job, formInstance?.getFormContext()
        );

        const filters = new FormFieldConfiguration(
            'job-form-field-filters',
            'Translatable#Filter', JobProperty.FILTER, 'job-input-filter', false,
            'Translatable#Helptext_Admin_JobCreateEdit_Filter', undefined,
            filtersValue ? new FormFieldValue(filtersValue) : null
        );
        const filterGroup = new FormGroupConfiguration(
            'job-new-form-group-filters', 'Translatable#Filter',
            undefined, undefined, [filters]
        );

        return new FormPageConfiguration(
            this.filterPageId, 'Translatable#Filter',
            undefined, undefined, undefined, [filterGroup]
        );
    }

    protected async getMacroPage(job: Job, formInstance: FormInstance): Promise<FormPageConfiguration> {
        const groups = [];

        let hasMacro = false;
        if (job && Array.isArray(job.Macros)) {
            const macros: Macro[] = await JobService.getMacrosOfJob(this.job)
                .catch((): Macro[] => []);

            hasMacro = macros.length > 0;

            for (const macro of macros) {
                const macroField = await MacroFieldCreator.createMacroField(macro, formInstance, this);
                groups.push(
                    new FormGroupConfiguration(
                        'job-form-group-macro', 'Translatable#Macro',
                        undefined, undefined, [macroField]
                    )
                );
            }
        }

        if (!hasMacro) {
            const macroField = await MacroFieldCreator.createMacroField(
                null, formInstance, this, undefined, undefined, job?.Type
            );
            groups.push(
                new FormGroupConfiguration(
                    'job-form-group-macro', 'Translatable#Macro', undefined, undefined, [macroField]
                )
            );
        }

        return new FormPageConfiguration(
            this.actionPageId, 'Translatable#Actions',
            undefined, undefined, undefined, groups
        );
    }

    public async getValue(
        property: string, formField: FormFieldConfiguration, value: any, job: Job, formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case JobProperty.EXEC_PLAN_WEEKDAYS:
                if (job && formContext === FormContext.EDIT) {
                    const execPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
                    if (execPlans) {
                        const timeExecPlans = execPlans.filter((ep) => ep.Type === ExecPlanTypes.TIME_BASED);
                        if (timeExecPlans && !!timeExecPlans.length) {
                            value = timeExecPlans[0].Parameters.Weekday;
                        }
                    }
                }
                break;
            case JobProperty.EXEC_PLAN_WEEKDAYS_TIMES:
                if (job && formContext === FormContext.EDIT) {
                    const execPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
                    if (execPlans) {
                        const timeExecPlans = execPlans.filter((ep) => ep.Type === ExecPlanTypes.TIME_BASED);
                        if (timeExecPlans && !!timeExecPlans.length) {
                            value = timeExecPlans[0].Parameters.Time;
                        }
                    }
                }
                break;
            case JobProperty.EXEC_PLAN_EVENTS:
                if (job && formContext === FormContext.EDIT) {
                    const execPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
                    if (execPlans) {
                        const eventExecPlans = execPlans.filter((ep) => ep.Type === ExecPlanTypes.EVENT_BASED);
                        if (eventExecPlans && !!eventExecPlans.length) {
                            value = eventExecPlans[0].Parameters.Event;
                        }
                    }
                }
                break;
            case JobProperty.MACROS:
                if (job && formContext === FormContext.EDIT) {
                    value = job.Type;
                }
                break;
            default:
        }
        return value;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        return [[property, value]];
    }

    public async postPrepareOptionValue(
        actionType: string, optionName: string, value: any, parameter: any,
        field: FormFieldConfiguration, formInstance: FormInstance
    ): Promise<any> {
        for (const extendedManager of this.extendedJobFormManager) {
            const result = await extendedManager.postPrepareOptionValue(
                actionType, optionName, value, parameter, field, formInstance
            );
            if (typeof result !== 'undefined') {
                return result;
            }
        }
        return;
    }

    public async getEventNodes(): Promise<TreeNode[]> {
        return await JobService.getInstance().getTreeNodes(
            JobProperty.EXEC_PLAN_EVENTS
        );
    }

    public async updateFields(fields: FormFieldConfiguration[]): Promise<void> {
        // only actions fields (no results or action-options)
        if (Array.isArray(fields) && fields.length && fields[0].property === JobProperty.MACRO_ACTIONS) {
            for (let i = 0; i < fields.length; i++) {
                const label = await TranslationService.translate('Translatable#{0}. Action', [i + 1]);
                fields[i].label = label;
            }
        }
    }
}
