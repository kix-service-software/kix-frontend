/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, KIXObjectProperty, FormFieldValue } from "../../model";
import { Job, JobProperty } from "../../model/kix/job";
import { FormFieldConfiguration } from "../../model/components/form/configuration";
import { KIXObjectService } from "../kix";
import { MacroActionType, MacroActionTypeOption } from "../../model/kix/macro";
import { TranslationService } from "../i18n/TranslationService";

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

    public getNewFormField(f: FormFieldConfiguration, parent?: FormFieldConfiguration): FormFieldConfiguration {
        return super.getNewFormField(f, parent, false);
    }

    public async getFormFieldsForAction(
        action: string, actionFieldInstanceId: string
    ): Promise<FormFieldConfiguration[]> {
        const fields: FormFieldConfiguration[] = [];
        if (action) {
            const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                KIXObjectType.MACRO_ACTION_TYPE, [action], null, null, true
            ).catch((error): MacroActionType[] => []);
            if (macroActionTypes && !!macroActionTypes.length) {
                for (const optionName in macroActionTypes[0].Options) {
                    if (optionName) {
                        const option = macroActionTypes[0].Options[optionName] as MacroActionTypeOption;
                        if (option) {
                            fields.push(
                                new FormFieldConfiguration(
                                    `job-action-${action}-${option.Name}`, option.Label,
                                    `ACTION###${actionFieldInstanceId}###${action}###${option.Name}`, null,
                                    Boolean(option.Required), option.Description
                                )
                            );
                        }
                    }
                }
            }
            fields.unshift(await this.getValidField(action, actionFieldInstanceId));
        }
        return fields;
    }

    private async getValidField(action: string, actionFieldInstanceId: string): Promise<FormFieldConfiguration> {
        return new FormFieldConfiguration(
            `job-action-${action}-skip`,
            'Translatable#Skip', `ACTION###${actionFieldInstanceId}###${action}###SKIP`,
            'checkbox-input', false,
            'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip', undefined,
            new FormFieldValue(false)
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
