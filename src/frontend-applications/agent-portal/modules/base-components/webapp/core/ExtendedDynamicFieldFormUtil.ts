/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDynamicFieldFormUtil } from './IDynamicFieldFormUtil';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ValidationResult } from './ValidationResult';
import { CheckListItem } from '../../../dynamic-fields/webapp/core/CheckListItem';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { KIXObjectFormService } from './KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class ExtendedDynamicFieldFormUtil implements IDynamicFieldFormUtil {

    public configureDynamicFields(form: FormConfiguration): Promise<void> {
        return null;
    }

    public handleDynamicFieldValues(
        formFields: FormFieldConfiguration[], object: KIXObject, formService: KIXObjectFormService
    ): Promise<void> {
        return null;
    }

    public handleDynamicField(
        field: FormFieldConfiguration, value: FormFieldValue<any>, parameter: Array<[string, any]>
    ): Promise<Array<[string, any]>> {
        return null;
    }

    public validateDFValue(dfName: string, value: any): Promise<ValidationResult[]> {
        return null;
    }

    public countValues(checklist: CheckListItem[]): [number, number] {
        return null;
    }

    public prepareDateField(field: FormFieldConfiguration, dynamicField: DynamicField): void {
        return null;
    }

    public createDynamicFormField(
        field: FormFieldConfiguration, objectType?: KIXObjectType | string
    ): Promise<boolean> {
        return null;
    }

    public async setFieldValue(
        dynamicField: DynamicField, dfValue: any, field: FormFieldConfiguration
    ): Promise<boolean> {
        return false;
    }

}
