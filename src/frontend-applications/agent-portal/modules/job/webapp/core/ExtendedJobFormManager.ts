/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable-next-line: max-line-length
import { Job } from '../../model/Job';
import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { MacroAction } from '../../model/MacroAction';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { ExecPlanTypes } from '../../model/ExecPlanTypes';
import { MacroActionTypeOption } from '../../model/MacroActionTypeOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
// tslint:enable

export class ExtendedJobFormManager {

    public job: Job;

    public filterManager: AbstractDynamicFormManager;

    public getPages(job: Job, formInstance: FormInstance): Promise<FormPageConfiguration[]> {
        return null;
    }

    public getValue(
        property: string, formField: FormFieldConfiguration, value: any, job: Job, formContext: FormContext
    ): Promise<any> {
        return null;
    }

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        return null;
    }

    public supportFilter(): boolean {
        return null;
    }

    public supportPlan(planType: ExecPlanTypes): boolean {
        return null;
    }

    public async postPrepareOptionValue(
        actionType: string, optionName: string, value: any, parameter: any,
        field: FormFieldConfiguration, formInstance: FormInstance
    ): Promise<any> {
        return;
    }

    public updateFields(fields: FormFieldConfiguration[]): Promise<void> {
        return null;
    }

    public reset(): void {
        return null;
    }

    protected getOptionField(
        option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string, fieldType?: string,
        defaultValue?, countDefault?: number, countMax?: number, countMin?: number, options: FormFieldOption[] = []
    ): FormFieldConfiguration {
        return new FormFieldConfiguration(
            `job-action-${actionType}-${option.Name}`, option.Label,
            `${actionFieldInstanceId}###${option.Name}`,
            fieldType, Boolean(option.Required), option.Description, options,
            typeof defaultValue !== 'undefined' ? new FormFieldValue(defaultValue) : undefined,
            null, null, null, countDefault, countMax, countMin,
        );
    }

    protected valueAsArray(parameter: any, optionName: string, value: any): any {
        if (!parameter[optionName]) {
            return [value];
        } else if (Array.isArray(parameter[optionName])) {
            parameter[optionName].push(value);
            return parameter[optionName];
        }
    }

    public async getEventNodes(): Promise<TreeNode[]> {
        return [];
    }
}
