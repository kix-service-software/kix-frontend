/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import {
    KIXObjectType, FormFieldValue, KIXObjectProperty, FormContext, ContextType, ArticleProperty
} from "../../model";
import { Job, JobProperty } from "../../model/kix/job";
import {
    FormFieldConfiguration, FormConfiguration, FormGroupConfiguration
} from "../../model/components/form/configuration";
import { KIXObjectService } from "../kix";
import { MacroActionType, MacroActionTypeOption, Macro, MacroAction } from "../../model/kix/macro";
import { TranslationService } from "../i18n/TranslationService";
import { JobService } from "./JobService";
import { ExecPlan, ExecPlanTypes } from "../../model/kix/exec-plan";
import { ContextService } from "../context";

export class JobFormService extends KIXObjectFormService<Job> {

    private static INSTANCE: JobFormService = null;

    public static getInstance(): JobFormService {
        if (!JobFormService.INSTANCE) {
            JobFormService.INSTANCE = new JobFormService();
        }

        return JobFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.JOB;
    }

    protected async prePrepareForm(form: FormConfiguration, job: Job): Promise<void> {
        if (!!form.pages.length && job) {
            PAGES:
            for (const page of form.pages) {
                if (!!page.groups.length) {
                    for (const group of page.groups) {
                        if (!!group.formFields.length) {
                            for (const field of group.formFields) {
                                if (field.property === JobProperty.MACRO_ACTIONS) {
                                    await this.prepareMacroActionFields(field, group, job);
                                    break PAGES;
                                }
                            }
                        }
                    }
                }
            }
        }

        const execPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
        if (execPlans && !!execPlans.length) {
            const eventExecPlans = execPlans.filter((ep) => ep.Type === ExecPlanTypes.EVENT_BASED);
            if (eventExecPlans && !!eventExecPlans.length) {
                const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                if (context) {
                    context.setAdditionalInformation(
                        JobProperty.EXEC_PLAN_EVENTS, eventExecPlans[0].Parameters.Event
                    );
                }

            }
        }
    }

    private async prepareMacroActionFields(
        field: FormFieldConfiguration, group: FormGroupConfiguration, job: Job
    ): Promise<void> {
        if (job) {
            const macros: Macro[] = await JobService.getMacrosOfJob(job);
            if (macros && !!macros.length && macros[0].Actions && macros[0].Actions.length) {
                const actions: MacroAction[] = [];
                if (macros[0].ExecOrder && !!macros[0].ExecOrder.length) {
                    macros[0].ExecOrder.forEach((aId) => {
                        const action = macros[0].Actions.find((a) => a.ID === aId);
                        if (action) {
                            actions.push(action);
                        }
                    });

                    macros[0].Actions.forEach((ma) => {
                        if (!actions.some((a) => a.ID === ma.ID)) {
                            actions.push(ma);
                        }
                    });

                    let actionIndex = 0;
                    for (const action of actions) {
                        let actionField = field;
                        if (actionIndex === 0) {
                            field.defaultValue = new FormFieldValue(action.Type);
                        } else {
                            actionField = new FormFieldConfiguration(
                                field.id,
                                field.label, field.property, field.inputComponent, field.required,
                                field.hint, field.options, new FormFieldValue(action.Type), field.fieldConfigurationIds,
                                undefined, field.parentInstanceId, field.countDefault, field.countMax, field.countMin,
                                field.maxLength, field.regEx, field.regExErrorMessage, field.empty, field.asStructure,
                                field.readonly, field.placeholder, undefined, field.showLabel, field.name
                            );
                            group.formFields.push(actionField);
                        }
                        actionIndex++;
                        const childFields = await this.getFormFieldsForAction(
                            action.Type, actionField.instanceId, action
                        );
                        actionField.children = childFields;
                    }
                }
            }
        }
    }

    protected async postPrepareForm(
        form: FormConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, job: Job
    ): Promise<void> {
        if (form && form.formContext === FormContext.EDIT) {
            for (const p of form.pages) {
                for (const g of p.groups) {
                    for (const f of g.formFields) {
                        if (f.property === JobProperty.MACRO_ACTIONS) {
                            f.defaultValue = null;
                        }
                    }
                }
            }
        }
    }

    protected async getValue(
        property: string, value: any, job: Job, formField: FormFieldConfiguration
    ): Promise<any> {
        switch (property) {
            case JobProperty.EXEC_PLAN_WEEKDAYS:
                if (job) {
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
                if (job) {
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
                if (job) {
                    const execPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
                    if (execPlans) {
                        const eventExecPlans = execPlans.filter((ep) => ep.Type === ExecPlanTypes.EVENT_BASED);
                        if (eventExecPlans && !!eventExecPlans.length) {
                            value = eventExecPlans[0].Parameters.Event;
                        }
                    }
                }
                break;
            case JobProperty.FILTER:
                if (job && job.Filter) {
                    const articleProperty = [
                        ArticleProperty.SENDER_TYPE_ID, ArticleProperty.CHANNEL_ID, ArticleProperty.TO,
                        ArticleProperty.CC, ArticleProperty.FROM, ArticleProperty.SUBJECT, ArticleProperty.BODY
                    ];
                    let hasArticleEvent = false;
                    value = {};
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                        const selectedEvents = context.getAdditionalInformation(JobProperty.EXEC_PLAN_EVENTS);
                        hasArticleEvent = selectedEvents
                            ? await JobService.getInstance().hasArticleEvent(selectedEvents)
                            : false;
                    }
                    for (const filterProperty in job.Filter) {
                        if (filterProperty && (hasArticleEvent || !articleProperty.some((p) => filterProperty === p))) {
                            value[filterProperty] = job.Filter[filterProperty];
                        }
                    }
                }
                break;
            default:
                if (property === JobProperty.MACRO_ACTIONS || property.match(/^ACTION###/)) {
                    value = formField.defaultValue ? formField.defaultValue.value : null;
                }
        }
        return value;
    }

    public getNewFormField(f: FormFieldConfiguration, parent?: FormFieldConfiguration): FormFieldConfiguration {
        return super.getNewFormField(f, parent, false);
    }

    public async getFormFieldsForAction(
        actionType: string, actionFieldInstanceId: string, action?: MacroAction
    ): Promise<FormFieldConfiguration[]> {
        const fields: FormFieldConfiguration[] = [];
        if (actionType) {
            const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                KIXObjectType.MACRO_ACTION_TYPE, [actionType], null, null, true
            ).catch((error): MacroActionType[] => []);
            if (macroActionTypes && !!macroActionTypes.length) {
                for (const optionName in macroActionTypes[0].Options) {
                    if (optionName) {
                        const option = macroActionTypes[0].Options[optionName] as MacroActionTypeOption;
                        if (option) {
                            let defaultValue;
                            if (action && action.Parameters) {
                                defaultValue = action.Parameters[option.Name];
                            }
                            fields.push(
                                new FormFieldConfiguration(
                                    `job-action-${actionType}-${option.Name}`, option.Label,
                                    `ACTION###${actionFieldInstanceId}###${actionType}###${option.Name}`, null,
                                    Boolean(option.Required), option.Description, undefined,
                                    typeof defaultValue !== undefined ? new FormFieldValue(defaultValue) : undefined
                                )
                            );
                        }
                    }
                }
            }
            fields.unshift(await this.getValidField(actionType, actionFieldInstanceId, action));
        }
        return fields;
    }

    private async getValidField(
        actionType: string, actionFieldInstanceId: string, action?: MacroAction
    ): Promise<FormFieldConfiguration> {
        let defaultValue;
        if (action) {
            defaultValue = action[KIXObjectProperty.VALID_ID] !== 1;
        }
        return new FormFieldConfiguration(
            `job-action-${actionType}-skip`,
            'Translatable#Skip', `ACTION###${actionFieldInstanceId}###${actionType}###SKIP`,
            'checkbox-input', false,
            'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip', undefined,
            typeof defaultValue !== undefined ? new FormFieldValue(defaultValue) : new FormFieldValue(false)
        );
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

}
