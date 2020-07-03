/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { Job } from '../../model/Job';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { JobProperty } from '../../model/JobProperty';
import { ExecPlan } from '../../model/ExecPlan';
import { JobService } from '.';
import { ExecPlanTypes } from '../../model/ExecPlanTypes';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../model/ContextType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { MacroAction } from '../../model/MacroAction';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { JobTypes } from '../../model/JobTypes';
import { IJobFormManager } from './IJobFormManager';
import { AbstractJobFormManager } from './AbstractJobFormManager';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../base-components/webapp/core/FormValuesChangedEventData';

export class JobFormService extends KIXObjectFormService {

    private static INSTANCE: JobFormService = null;

    public static getInstance(): JobFormService {
        if (!JobFormService.INSTANCE) {
            JobFormService.INSTANCE = new JobFormService();
        }

        return JobFormService.INSTANCE;
    }

    private constructor() {
        super();

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, {
            eventSubscriberId: 'JobFormService',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string) => {
                const form = data.formInstance.getForm();
                if (form.objectType === KIXObjectType.JOB) {
                    const typeValue = data.changedValues.find((cv) => cv[0] && cv[0].property === JobProperty.TYPE);
                    if (typeValue) {
                        await data.formInstance.removePages(null, [data.formInstance.getForm().pages[0].id]);

                        if (typeValue[1] && typeValue[1].value) {
                            const manager: IJobFormManager = this.getJobFormManager(typeValue[1].value);
                            if (manager) {
                                if (data.formInstance.getForm().formContext === FormContext.NEW) {
                                    manager.reset();
                                }
                                const pages = await manager.getPages(data.formInstance.getForm().formContext);
                                pages.forEach((p) => data.formInstance.addPage(p));
                            }
                        }
                    }
                }
            }
        });
    }

    private jobFormManager: Map<JobTypes | string, IJobFormManager> = new Map();

    public getJobFormManager(type: JobTypes | string): IJobFormManager {
        return this.jobFormManager.get(type);
    }

    public registerJobFormManager(type: JobTypes, manager: IJobFormManager): void {
        this.jobFormManager.set(type, manager);
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.JOB;
    }

    protected async prePrepareForm(form: FormConfiguration, job: Job): Promise<void> {
        form.pages = [];
        form.pages.push(AbstractJobFormManager.getJobPage(form.formContext));

        if (form.pages.length && job && form.formContext === FormContext.EDIT) {
            const manager = this.getJobFormManager(job.Type);
            manager.job = job;

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

            const pages = await manager.getPages(form.formContext);
            form.pages = [...form.pages, ...pages];
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
        property: string, value: any, job: Job, formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (job) {
            const manager = this.getJobFormManager(job.Type);
            value = manager.getValue(property, formField, value, job, formContext);
        }
        return value;
    }

    public getNewFormField(f: FormFieldConfiguration, parent?: FormFieldConfiguration): FormFieldConfiguration {
        const field = super.getNewFormField(f, parent, false);
        if (field.property === JobProperty.MACRO_ACTIONS) {
            field.defaultValue = null;
            field.hint = field.defaultHint;
            field.children = [];
        }
        return field;
    }

    public async prepareCreateValue(
        property: string, formfield: FormFieldConfiguration, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const manager = this.getJobFormManager(typeValue ? typeValue.value : null);
        if (manager) {
            const p = await manager.prepareCreateValue(property, formfield, value);
            if (property.startsWith('MACRO_ACTION')) {
                p[0][0] = formfield.instanceId;
            }
            return p;
        }

        return [[property, value]];
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext
    ): Promise<Array<[string, any]>> {
        const actionTypesParameter = parameter.filter((p) => p[0].startsWith(JobProperty.MACRO_ACTIONS));
        const actionAttributesParameter = parameter.filter((p) => p[0].match(/^ACTION###/));

        parameter = parameter.filter(
            (p) => p[0] !== JobProperty.MACRO_ACTIONS && !p[0].match(/^ACTION###/)
        );

        const actions: Map<string, MacroAction> = new Map();
        actionTypesParameter.forEach((p) => {
            if (p[1]) {
                // value prepared in action input component
                const actionFieldInstanceId = p[0].replace(/^(.+)###.+/, '$1');
                const actionType = p[1].replace(/^.+###(.+)/, '$1');
                let action = actions.get(actionFieldInstanceId);
                if (!action) {
                    action = new MacroAction();
                    action.Type = actionType;
                    action.Parameters = {};
                    actions.set(actionFieldInstanceId, action);
                }
            }
        });

        actionAttributesParameter.forEach((p) => {

            // key prepared in job form service
            const actionFieldInstanceId = p[0].replace(/^ACTION###(.+)###.+/, '$1');
            const valueName = p[0].replace(/^ACTION###.+###(.+)/, '$1');

            const action = actions.get(actionFieldInstanceId);
            if (action) {
                if (valueName === 'SKIP') {
                    // true means "skip" (checkbox), so valid id have to mean "invalid" (= 2)
                    action.ValidID = p[1] ? 2 : 1;
                } else {
                    action.Parameters[valueName] = p[1];
                }
            }
        });

        parameter.push([
            JobProperty.MACRO_ACTIONS, Array.from(actions.values())
        ]);
        return super.postPrepareValues(parameter, createOptions, formContext);
    }

    public async getFormFieldsForAction(
        actionType: string, actionFieldInstanceId: string, type: string, action?: MacroAction
    ): Promise<FormFieldConfiguration[]> {
        let formFields = [];
        if (type) {
            const manager = this.getJobFormManager(type);
            formFields = await manager.getFormFieldsForAction(actionType, actionFieldInstanceId, type, action);
        }
        return formFields;
    }

    public async updateFields(fields: FormFieldConfiguration[], formInstance: FormInstance): Promise<void> {
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;
        const manager = this.getJobFormManager(type);

        if (manager) {
            manager.updateFields(fields);
        }
    }

}
