/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXService } from './IKIXService';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormInstance } from './FormInstance';

export interface IKIXObjectFormService extends IKIXService {

    initValues(
        form: FormConfiguration, formInstance: FormInstance, kixObject?: KIXObject
    ): Promise<void>;

    getNewFormField(
        formField: FormFieldConfiguration, parent?: FormFieldConfiguration, withChildren?: boolean
    ): FormFieldConfiguration;

    updateFields(fields: FormFieldConfiguration[], formInstance: FormInstance): Promise<void>;

    getFormParameter(
        formId: string, forUpdate?: boolean, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>>;

    prepareUpdateValue(
        property: string, formField: FormFieldConfiguration, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>>;

    prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>>;

    postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext
    ): Promise<Array<[string, any]>>;

    preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>>;

    prepareCreateParameter(object: KIXObject): Array<[string, any]>;

}
