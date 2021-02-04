/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public createOptionFields(
        actionType: string, actionFieldInstanceId: string, type: string, action?: MacroAction
    ): Promise<FormFieldConfiguration[]> {
        return null;
    }

    public createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ) {
        return null;
    }

    public supportFilter(): boolean {
        return null;
    }

    public supportPlan(planType: ExecPlanTypes): boolean {
        return null;
    }

    public prepareCreateValue(property: string, formField: FormFieldConfiguration, value: any):
        Promise<Array<[string, any]>> {
        return null;
    }

    public postPrepareOptionValue(action: MacroAction, optionName: string, value: any): any {
        return null;
    }

    public updateFields(fields: FormFieldConfiguration[]): Promise<void> {
        return null;
    }

    public reset(): void {
        return null;
    }

    protected getOptionField(
        option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string, fieldType?: string,
        defaultValue?, countDefault?: number, countMax?: number, countMin?: number
    ): FormFieldConfiguration {
        return new FormFieldConfiguration(
            `job-action-${actionType}-${option.Name}`, option.Label,
            `${actionFieldInstanceId}###${option.Name}`,
            fieldType, Boolean(option.Required), option.Description, undefined,
            typeof defaultValue !== 'undefined' ? new FormFieldValue(defaultValue) : undefined,
            null, null, null, countDefault, countMax, countMin,
        );
    }

    protected valueAsArray(action: MacroAction, optionName: string, value: any): any {
        if (!action.Parameters[optionName]) {
            return [value];
        } else if (Array.isArray(action.Parameters[optionName])) {
            action.Parameters[optionName].push(value);
            return action.Parameters[optionName];
        }
    }

    public async getEventNodes(): Promise<TreeNode[]> {
        return [];
    }
}
