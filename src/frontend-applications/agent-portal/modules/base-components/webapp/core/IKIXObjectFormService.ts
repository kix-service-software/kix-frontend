/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXService } from "./IKIXService";
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { KIXObjectSpecificCreateOptions } from "../../../../model/KIXObjectSpecificCreateOptions";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { SearchFormInstance } from "./SearchFormInstance";
import { IFormInstance } from "./IFormInstance";
import { FormContext } from "../../../../model/configuration/FormContext";

export interface IKIXObjectFormService extends IKIXService {

    initValues(form: FormConfiguration): Promise<Map<string, FormFieldValue<any>>>;

    initOptions(form: FormConfiguration): Promise<void>;

    getNewFormField(
        formField: FormFieldConfiguration, parent?: FormFieldConfiguration, withChildren?: boolean
    ): FormFieldConfiguration;

    updateForm(
        formInstance: IFormInstance | SearchFormInstance,
        form: FormConfiguration, formField: FormFieldConfiguration, value: any
    ): Promise<void>;

    updateFields(fields: FormFieldConfiguration[], formInstance: IFormInstance): Promise<void>;

    prepareFormFields(
        formId: string, forUpdate?: boolean, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>>;

    prepareUpdateValue(property: string, value: any, formInstance: IFormInstance): Promise<Array<[string, any]>>;

    prepareCreateValue(property: string, value: any, formInstance: IFormInstance): Promise<Array<[string, any]>>;

    postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext
    ): Promise<Array<[string, any]>>;

    preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>>;

    prepareCreateParameter(object: KIXObject): Array<[string, any]>;

    resetChildrenOnEmpty(formField: FormFieldConfiguration): void;

}
