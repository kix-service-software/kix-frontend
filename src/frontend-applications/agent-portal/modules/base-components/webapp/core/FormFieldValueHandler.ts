/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInstance } from './FormInstance';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export abstract class FormFieldValueHandler {

    public abstract id: string;

    public abstract objectType: KIXObjectType | string;

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        return;
    }

    public async postInitValues(formInstance: FormInstance): Promise<void> {
        return;
    }

}
