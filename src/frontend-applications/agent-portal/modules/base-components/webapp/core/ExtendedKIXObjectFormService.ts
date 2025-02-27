/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormInstance } from './FormInstance';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';

export class ExtendedKIXObjectFormService {

    public async postInitValues(
        form: FormConfiguration, formInstance: FormInstance, kixObject?: KIXObject
    ): Promise<void> {
        return null;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {
        return parameter;
    }

    public async prePrepareForm(
        form: FormConfiguration, kixObject: KIXObject, formInstance: FormInstance
    ): Promise<void> {
        return;
    }

    public async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, kixObject: KIXObject
    ): Promise<void> {
        return;
    }

}
