/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectSpecificCreateOptions } from "../../../../model/KIXObjectSpecificCreateOptions";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { DynamicField } from "../../model/DynamicField";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { FormContext } from "../../../../model/configuration/FormContext";
import { LabelService } from "../../../base-components/webapp/core/LabelService";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { DynamicFieldType } from "../../model/DynamicFieldType";
import { DynamicFieldProperty } from "../../model/DynamicFieldProperty";

export class DynamicFieldFormService extends KIXObjectFormService {

    private static INSTANCE: DynamicFieldFormService;

    public static getInstance(): DynamicFieldFormService {
        if (!DynamicFieldFormService.INSTANCE) {
            DynamicFieldFormService.INSTANCE = new DynamicFieldFormService();
        }
        return DynamicFieldFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.DYNAMIC_FIELD;
    }

    public async prepareFormFieldValues(
        formFields: FormFieldConfiguration[], dynamicField: DynamicField,
        formFieldValues: Map<string, FormFieldValue<any>>,
        formContext: FormContext
    ): Promise<void> {
        for (const f of formFields) {
            let formFieldValue: FormFieldValue;
            if (dynamicField || f.defaultValue) {
                let value = await this.getValue(
                    f.property,
                    dynamicField && formContext === FormContext.EDIT ? dynamicField[f.property] :
                        f.defaultValue ? f.defaultValue.value : null,
                    dynamicField,
                    f
                );

                if (f.property === 'ICON') {
                    if (dynamicField && formContext === FormContext.EDIT) {
                        const icon = LabelService.getInstance().getObjectIcon(dynamicField);
                        if (icon instanceof ObjectIcon) {
                            value = icon;
                        }
                    } else {
                        value = f.defaultValue.value;
                    }
                }

                if (
                    dynamicField && f.property === DynamicFieldProperty.CONFIG &&
                    dynamicField.FieldType === DynamicFieldType.SELECTION
                ) {
                    const oldPossibleValues = value.PossibleValues;
                    const possibleValueArray = [];
                    Object.keys(oldPossibleValues).forEach((key) => {
                        const newPossibleValues = {};
                        newPossibleValues['Key'] = key;
                        newPossibleValues['Value'] = oldPossibleValues[key];
                        possibleValueArray.push(newPossibleValues);
                    });
                    value.PossibleValues = possibleValueArray;
                    value.PossibleNone = Boolean(value.PossibleNone === '1');
                    value.TranslatableValues = Boolean(value.TranslatableValues === '1');
                }

                formFieldValue = dynamicField && formContext === FormContext.EDIT
                    ? new FormFieldValue(value)
                    : new FormFieldValue(value, f.defaultValue ? f.defaultValue.valid : undefined);
            } else {
                formFieldValue = new FormFieldValue(null);
            }
            formFieldValues.set(f.instanceId, formFieldValue);

            if (f.children) {
                this.prepareFormFieldValues(f.children, dynamicField, formFieldValues, formContext);
            }
        }
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>> {

        const fieldTypeParameter = parameter.find((p) => p[0] === DynamicFieldProperty.FIELD_TYPE);
        const configParameter = parameter.find((p) => p[0] === DynamicFieldProperty.CONFIG);

        if (configParameter) {
            if (fieldTypeParameter[1] === DynamicFieldType.SELECTION) {
                configParameter[1].PossibleNone = configParameter[1].PossibleNone ? 1 : 0;
                configParameter[1].TranslatableValues = configParameter[1].TranslatableValues ? 1 : 0;
                const possibleValue = configParameter[1].PossibleValues;
                const possibleValueHash = {};
                possibleValue.forEach((p) => possibleValueHash[p.Key] = p.Value);
                configParameter[1].PossibleValues = possibleValueHash;
            }
        }

        return parameter;
    }

}
