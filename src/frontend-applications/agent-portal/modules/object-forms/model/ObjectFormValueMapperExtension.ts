/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { KIXObject } from '../../../model/kix/KIXObject';
import { DynamicField } from '../../dynamic-fields/model/DynamicField';
import { DynamicFieldValue } from '../../dynamic-fields/model/DynamicFieldValue';
import { ObjectFormValue } from './FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from './ObjectFormValueMapper';

export abstract class ObjectFormValueMapperExtension<T extends KIXObject = KIXObject>{

    public constructor(protected objectValueMapper: ObjectFormValueMapper) { }

    public destroy(): void {
        return;
    }

    public async mapObjectValues(object: T): Promise<void> {
        return;
    }

    public async createFormValue(property: string, object: T): Promise<ObjectFormValue> {
        return null;
    }

    public async initFormValueByField(field: FormFieldConfiguration, formValue: ObjectFormValue): Promise<void> {
        return;
    }

    public async postMapFormValues(object: T): Promise<void> {
        return;
    }

    public async createDynamicFieldFormValue(
        dynamicField: DynamicField, dynamicFieldValue: DynamicFieldValue, parent: ObjectFormValue
    ): Promise<ObjectFormValue> {
        return null;
    }

}