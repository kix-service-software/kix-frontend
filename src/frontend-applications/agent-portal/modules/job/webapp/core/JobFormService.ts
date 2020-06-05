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
import { IFormInstance } from '../../../base-components/webapp/core/IFormInstance';
import { IJobFormManager } from './IJobFormManager';
import { AbstractJobFormManager } from './AbstractJobFormManager';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';

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
        }
    }

    public async updateForm(
        formInstance: IFormInstance, form: FormConfiguration, formField: FormFieldConfiguration, type: any
    ): Promise<void> {
        if (formField && formField.property === JobProperty.TYPE) {
            await formInstance.removePages(null, [form.pages[0].id]);

            if (type) {
                const manager: IJobFormManager = this.getJobFormManager(type);
                if (manager) {
                    if (form.formContext === FormContext.NEW) {
                        manager.reset();
                    }
                    const pages = await manager.getPages(form.formContext);
                    pages.forEach((p) => formInstance.addPage(p));
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
        property: string, value: any, job: Job, formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (job) {
            const manager = this.getJobFormManager(job.Type);
            value = manager.getValue(property, value, job, formContext);
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
        property: string, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const manager = this.getJobFormManager(typeValue ? typeValue.value : null);
        if (manager) {
            return manager.prepareCreateValue(property, value);
        }

        return [[property, value]];
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>> {
        const actionAttributesParameter = parameter.filter((p) => p[0].match(/^ACTION###/));
        const actionTypesParameter = parameter.filter((p) => p[0] === JobProperty.MACRO_ACTIONS);

        parameter = parameter.filter(
            (p) => p[0] !== JobProperty.MACRO_ACTIONS && !p[0].match(/^ACTION###/)
        );

        const actions: Map<string, MacroAction> = new Map();
        actionTypesParameter.forEach((p) => {
            if (p[1]) {
                // value prepared in action input component
                const actionFieldInstanceId = p[1].replace(/^(.+)###.+/, '$1');
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
        return parameter;
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

    public async updateFields(fields: FormFieldConfiguration[], formInstance: IFormInstance): Promise<void> {
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;
        const manager = this.getJobFormManager(type);

        if (manager) {
            manager.updateFields(fields);
        }
    }

    public resetChildrenOnEmpty(formField: FormFieldConfiguration): void {
        if (formField.property === JobProperty.MACRO_ACTIONS) {
            formField.children = [];
        } else {
            super.resetChildrenOnEmpty(formField);
        }
    }
}
