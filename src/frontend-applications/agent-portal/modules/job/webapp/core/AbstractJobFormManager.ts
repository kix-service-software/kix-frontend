/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IJobFormManager } from "./IJobFormManager";
import { FormGroupConfiguration } from "../../../../model/configuration/FormGroupConfiguration";
import { JobProperty } from "../../model/JobProperty";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { FormFieldOption } from "../../../../model/configuration/FormFieldOption";
import { DefaultSelectInputFormOption } from "../../../../model/configuration/DefaultSelectInputFormOption";
import { TreeNode } from "../../../base-components/webapp/core/tree";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { FormPageConfiguration } from "../../../../model/configuration/FormPageConfiguration";
import { Macro } from "../../model/Macro";
import { JobService } from ".";
import { MacroAction } from "../../model/MacroAction";
import { IdService } from "../../../../model/IdService";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { Job } from "../../model/Job";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { MacroActionType } from "../../model/MacroActionType";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { MacroActionTypeOption } from "../../model/MacroActionTypeOption";
import { ExecPlan } from "../../model/ExecPlan";
import { ExecPlanTypes } from "../../model/ExecPlanTypes";
import { AbstractDynamicFormManager } from "../../../base-components/webapp/core/dynamic-form";
import { FormContext } from "../../../../model/configuration/FormContext";
import { ObjectReferenceOptions } from "../../../base-components/webapp/core/ObjectReferenceOptions";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";

export class AbstractJobFormManager implements IJobFormManager {

    public filterManager: AbstractDynamicFormManager;

    public job: Job = null;
    protected execPageId: string = 'job-form-page-execution-plan';
    protected filterPageId: string = 'job-form-page-filters';
    protected actionPageId: string = 'job-form-page-actions';

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

    public async getPages(formContext: FormContext): Promise<FormPageConfiguration[]> {
        const execPlanPage = await this.getExecPlanPage(formContext);
        const filterPage = await this.getFilterPage(formContext);
        const actionPage = await this.getActionPage(formContext);
        return [execPlanPage, filterPage, actionPage];
    }

    public static getJobPage(formContext: FormContext): FormPageConfiguration {
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
                            formContext === FormContext.EDIT
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

    protected async getExecPlanPage(formContext: FormContext): Promise<FormPageConfiguration> {
        const timeGroup = await this.getTimeGroup(formContext);
        const eventGroup = await this.getEventGroup(formContext);
        return new FormPageConfiguration(
            this.execPageId, 'Translatable#Execution Plan',
            undefined, undefined, undefined, [timeGroup, eventGroup]
        );
    }

    protected async getTimeGroup(formContext: FormContext): Promise<FormGroupConfiguration> {
        const weekdaysValue = await this.getValue(JobProperty.EXEC_PLAN_WEEKDAYS, null, this.job, formContext);
        const weekdays = new FormFieldConfiguration(
            'job-form-field-weekdays',
            'Translatable#Weekday(s)', JobProperty.EXEC_PLAN_WEEKDAYS, 'default-select-input', false,
            'Translatable#Helptext_Admin_JobCreateEdit_Days',
            [
                new FormFieldOption(
                    DefaultSelectInputFormOption.NODES,
                    [
                        new TreeNode("Mon", 'Translatable#Monday'),
                        new TreeNode("Tue", 'Translatable#Tuesday'),
                        new TreeNode("Wed", 'Translatable#Wednesday'),
                        new TreeNode("Thu", 'Translatable#Thursday'),
                        new TreeNode("Fri", 'Translatable#Friday'),
                        new TreeNode("Sat", 'Translatable#Saturday'),
                        new TreeNode("Sun", 'Translatable#Sunday')
                    ]
                ),
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
            ], weekdaysValue ? new FormFieldValue(weekdaysValue) : undefined
        );

        const timeNodes = [];
        [...Array(24)].forEach((v, i) => {
            const hour = i < 10 ? '0' + i.toString() : i;
            timeNodes.push(new TreeNode(hour + ':00:00', i + ':00'));
            timeNodes.push(new TreeNode(hour + ':30:00', i + ':30'));
        });

        const timesValue = await this.getValue(JobProperty.EXEC_PLAN_WEEKDAYS_TIMES, null, this.job, formContext);
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
        const eventsValue = await this.getValue(JobProperty.EXEC_PLAN_EVENTS, null, this.job, formContext);
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

    protected async getFilterPage(formContext: FormContext): Promise<FormPageConfiguration> {
        const filtersValue = await this.getValue(JobProperty.FILTER, null, this.job, formContext);
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

    protected async getActionPage(formContext: FormContext): Promise<FormPageConfiguration> {
        const actionsField = new FormFieldConfiguration(
            'job-form-field-actions',
            '1. Action', JobProperty.MACRO_ACTIONS, 'job-input-actions', false,
            'Translatable#Helptext_Admin_JobCreateEdit_Actions', undefined, undefined, undefined, undefined,
            undefined, 1, 200, 0
        );
        const actionGroup = new FormGroupConfiguration(
            'job-form-group-actions', 'Translatable#Actions',
            undefined, undefined, [actionsField], true
        );
        await this.prepareMacroActionFields(actionsField, actionGroup);

        return new FormPageConfiguration(
            this.actionPageId, 'Translatable#Actions',
            undefined, undefined, undefined, [actionGroup]
        );
    }

    protected async prepareMacroActionFields(
        field: FormFieldConfiguration, group: FormGroupConfiguration
    ): Promise<void> {
        if (this.job) {
            const macros: Macro[] = await JobService.getMacrosOfJob(this.job);
            if (macros && macros.length && macros[0].Actions && macros[0].Actions.length) {
                const macro = macros[0];
                const actions: MacroAction[] = [];
                if (macro.ExecOrder && macro.ExecOrder.length) {
                    macro.ExecOrder.forEach((aId) => {
                        const action = macro.Actions.find((a) => a.ID === aId);
                        if (action) {
                            actions.push(action);
                        }
                    });

                    macro.Actions.forEach((ma) => {
                        if (!actions.some((a) => a.ID === ma.ID)) {
                            actions.push(ma);
                        }
                    });

                    for (let i = 0; i < actions.length; i++) {
                        const action = actions[i];
                        let actionField = field;
                        if (i === 0) {
                            actionField.defaultValue = new FormFieldValue(action.Type);
                        } else {
                            actionField = new FormFieldConfiguration(
                                field.id,
                                field.label, field.property, field.inputComponent, field.required,
                                field.hint, field.options, new FormFieldValue(action.Type),
                                field.fieldConfigurationIds, undefined, field.parentInstanceId, field.countDefault,
                                field.countMax, field.countMin, field.maxLength, field.regEx, field.regExErrorMessage,
                                field.empty, field.asStructure, field.readonly, field.placeholder, undefined,
                                field.showLabel, field.name
                            );
                            group.formFields.push(actionField);
                        }
                        actionField.instanceId = IdService.generateDateBasedId(field.property);
                        const childFields = await this.getFormFieldsForAction(
                            action.Type, actionField.instanceId, macro.Type, action
                        );
                        actionField.children = childFields;
                    }
                    await this.updateFields(group.formFields);
                }
            }
        }
    }

    public async updateFields(fields: FormFieldConfiguration[]): Promise<void> {
        const actionsFields = fields.filter((ff) => ff.property === JobProperty.MACRO_ACTIONS);
        if (actionsFields) {
            for (let i = 0; i < actionsFields.length; i++) {
                const label = await TranslationService.translate('Translatable#{0}. Action', [i + 1]);
                actionsFields[i].label = label;
            }
        }
    }

    public async getFormFieldsForAction(
        actionType: string, actionFieldInstanceId: string, type: string, action?: MacroAction
    ): Promise<FormFieldConfiguration[]> {
        const fields: FormFieldConfiguration[] = [];
        if (!actionFieldInstanceId) {
            console.error('No "actionFieldInstanceID" given!');
        } else {
            if (actionType) {
                const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                    KIXObjectType.MACRO_ACTION_TYPE, [actionType], null, { id: type }, true
                ).catch((error): MacroActionType[] => []);
                if (macroActionTypes && !!macroActionTypes.length) {
                    for (const optionName in macroActionTypes[0].Options) {
                        if (optionName) {
                            const option = macroActionTypes[0].Options[optionName] as MacroActionTypeOption;
                            if (option) {
                                const actionPropertyField = this.getActionOptionField(
                                    action, option, actionType, actionFieldInstanceId
                                );

                                // special instance id to distinguish between the actions
                                actionPropertyField.instanceId = IdService.generateDateBasedId(
                                    `ACTION###${actionFieldInstanceId}###${option.Name}`
                                );

                                fields.push(actionPropertyField);
                            }
                        }
                    }
                }
                const validField = await this.getValidField(actionType, actionFieldInstanceId, action);

                // special instance id to distinguish between the actions
                validField.instanceId = IdService.generateDateBasedId(`ACTION###${actionFieldInstanceId}###SKIP`);

                fields.unshift(validField);
            }
        }
        return fields;
    }

    private getActionOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string
    ) {
        let defaultValue;
        if (action && action.Parameters) {
            defaultValue = action.Parameters[option.Name];
        }
        const inputType = (actionType === 'ArticleCreate' || actionType === 'TicketCreate')
            && option.Name === 'Body' ? 'rich-text-input' : null;
        return new FormFieldConfiguration(
            `job-action-${actionType}-${option.Name}`, option.Label,
            `ACTION###${actionFieldInstanceId}###${option.Name}`,
            inputType, Boolean(option.Required), option.Description, undefined,
            typeof defaultValue !== undefined ? new FormFieldValue(defaultValue) : undefined);

    }

    private async getValidField(
        actionType: string, actionFieldInstanceId: string, action?: MacroAction
    ): Promise<FormFieldConfiguration> {
        let defaultValue;
        if (action) {
            defaultValue = action[KIXObjectProperty.VALID_ID] !== 1;
        }
        return new FormFieldConfiguration(
            `job-action-${actionType}-skip`, 'Translatable#Skip',
            `ACTION###${actionFieldInstanceId}###SKIP`,
            'checkbox-input', false,
            'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip', undefined,
            typeof defaultValue !== undefined ? new FormFieldValue(defaultValue) : new FormFieldValue(false)
        );
    }

    public async getValue(property: string, value: any, job: Job, formContext: FormContext): Promise<any> {
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
            default:
        }
        return value;
    }

    public async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return [[property, value]];
    }

}
