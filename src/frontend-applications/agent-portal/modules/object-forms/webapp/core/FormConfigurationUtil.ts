/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';

export class FormConfigurationUtil {

    public static getConfiguredFieldIds(form: FormConfiguration): string[] {
        const fieldIds: string[] = [];
        for (const page of form?.pages || []) {
            for (const group of page.groups) {
                fieldIds.push(...this.getFieldIds(group.formFields));
            }
        }

        return fieldIds;
    }

    public static getFieldIds(formFields: FormFieldConfiguration[] = []): string[] {
        const fieldIds: string[] = [];
        for (const field of formFields) {
            fieldIds.push(field.id);
            if (field.children?.length) {
                fieldIds.push(...this.getFieldIds(field.children));
            }
        }

        return fieldIds;
    }

}