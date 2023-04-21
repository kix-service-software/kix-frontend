/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { DynamicFieldAffectedAssetFormValue } from './DynamicFields/DynamicFieldAffectedAssetFormValue';
import { DynamicFieldChecklistFormValue } from './DynamicFields/DynamicFieldChecklistFormValue';
import { DynamicFieldCIReferenceFormValue } from './DynamicFields/DynamicFieldCIReferenceFormValue';
import { DynamicFieldCountableFormValue } from './DynamicFields/DynamicFieldCountableFormValue';
import { DynamicFieldDateTimeFormValue } from './DynamicFields/DynamicFieldDateTimeFormValue';
import { DynamicFieldSelectionFormValue } from './DynamicFields/DynamicFieldSelectionFormValue';
import { DynamicFieldTableFormValue } from './DynamicFields/DynamicFieldTableFormValue';
import { DynamicFieldTextAreaFormValue } from './DynamicFields/DynamicFieldTextAreaFormValue';
import { DynamicFieldTextFormValue } from './DynamicFields/DynamicFieldTextFormValue';
import { ObjectFormValue } from './ObjectFormValue';

export class DynamicFieldObjectFormValue extends ObjectFormValue<DynamicFieldValue> {

    public constructor(
        public property: string,
        object: KIXObject,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.visible = false;
        this.enabled = true;
    }

    public async initFormValue(): Promise<void> {
        if (this.objectValueMapper?.object?.KIXObjectType) {
            const dynamicFields = await KIXObjectService.loadDynamicFields(this.objectValueMapper.object.KIXObjectType);
            if (dynamicFields?.length) {
                for (const df of dynamicFields) {
                    let dynamicFieldValue;
                    if (Array.isArray(this.value) && this.value.length) {
                        dynamicFieldValue = this.value.find((v) => v.Name === df.Name);
                    }
                    const formValue = this.findFormValue(df.Name);
                    if (!formValue) {
                        await this.createFormValue(df.Name, dynamicFieldValue);
                    }
                }
            }
        }

        this.inputComponentId = null;
        this.visible = false;
        this.enabled = true;
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        const nameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
        let formValue = this.findFormValue(nameOption?.value);
        if (!formValue) {
            const dfValue = this.object.DynamicFields?.find((df) => df.Name === nameOption?.value);
            formValue = await this.createFormValue(nameOption?.value, dfValue);
        }

        if (formValue) {
            formValue.initFormValueByField(field);
        } else {
            console.warn(`Could not find/create form value for dynamic field ${nameOption?.value}`);
            console.warn(field);
        }
    }

    public async createFormValue(
        dfName: string, dynamicFieldValue?: DynamicFieldValue, addFormValue: boolean = true
    ): Promise<ObjectFormValue> {
        let formValue: ObjectFormValue;

        if (!dynamicFieldValue && Array.isArray(this.value)) {
            dynamicFieldValue = new DynamicFieldValue();
            dynamicFieldValue.Name = dfName;
            dynamicFieldValue.Value = null;
            this.value.push(dynamicFieldValue);
        }

        const dynamicField = await KIXObjectService.loadDynamicField(dfName);

        for (const mapperExtension of this.objectValueMapper.extensions) {
            formValue = await mapperExtension.createDynamicFieldFormValue(dynamicField, dynamicFieldValue, this);
            if (formValue) {
                break;
            }
        }

        if (!formValue) {
            switch (dynamicField?.FieldType) {
                case DynamicFieldTypes.TEXT:
                    formValue = new DynamicFieldCountableFormValue(
                        'Value', dynamicFieldValue, this.objectValueMapper, this, dfName, DynamicFieldTextFormValue
                    );
                    break;
                case DynamicFieldTypes.TEXT_AREA:
                    formValue = new DynamicFieldCountableFormValue(
                        'Value', dynamicFieldValue, this.objectValueMapper, this, dfName, DynamicFieldTextAreaFormValue
                    );
                    break;
                case DynamicFieldTypes.DATE:
                case DynamicFieldTypes.DATE_TIME:
                    formValue = new DynamicFieldCountableFormValue(
                        'Value', dynamicFieldValue, this.objectValueMapper, this, dfName, DynamicFieldDateTimeFormValue
                    );
                    break;
                case DynamicFieldTypes.SELECTION:
                    formValue = new DynamicFieldSelectionFormValue(
                        'Value', dynamicFieldValue, this.objectValueMapper, this, dfName
                    );
                    break;
                case DynamicFieldTypes.CI_REFERENCE:
                    dfName === 'AffectedAsset' ?
                        formValue = new DynamicFieldAffectedAssetFormValue(
                            'Value', dynamicFieldValue, this.objectValueMapper, this, dfName
                        ) :
                        formValue = new DynamicFieldCIReferenceFormValue(
                            'Value', dynamicFieldValue, this.objectValueMapper, this, dfName
                        );
                    break;
                case DynamicFieldTypes.TABLE:
                    formValue = new DynamicFieldTableFormValue(
                        'Value', dynamicFieldValue, this.objectValueMapper, this, dfName
                    );
                    break;
                case DynamicFieldTypes.CHECK_LIST:
                    formValue = new DynamicFieldChecklistFormValue(
                        'Value', dynamicFieldValue, this.objectValueMapper, this, dfName
                    );
                    break;
                default:
            }
        }

        if (formValue) {
            formValue.label = await TranslationService.translate(dynamicField.Label);

            if (addFormValue) {
                this.formValues.push(formValue);
            }
        }

        return formValue;
    }

    public findFormValue(property: string): ObjectFormValue {
        const dfName = KIXObjectService.getDynamicFieldName(property);
        return super.findFormValue(dfName || property);
    }
}