/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormPageConfiguration } from "../../../../model/configuration/FormPageConfiguration";
import { Job } from "../../model/Job";
import { MacroAction } from "../../model/MacroAction";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { AbstractDynamicFormManager } from "../../../base-components/webapp/core/dynamic-form";
import { ExecPlanTypes } from "../../model/ExecPlanTypes";
import { FormContext } from "../../../../model/configuration/FormContext";

export interface IJobFormManager {

    job: Job;

    filterManager: AbstractDynamicFormManager;

    getPages(formContext: FormContext): Promise<FormPageConfiguration[]>;

    getValue(property: string, value: any, job: Job, formContext: FormContext): Promise<any>;

    getFormFieldsForAction(
        actionType: string, actionFieldInstanceId: string, type: string, action?: MacroAction
    ): Promise<FormFieldConfiguration[]>;

    supportFilter(): boolean;

    supportPlan(planType: ExecPlanTypes): boolean;

    prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>>;

    updateFields(fields: FormFieldConfiguration[]): Promise<void>;

    reset(): void;

}
