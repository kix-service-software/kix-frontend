/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { DynamicField } from '../../model/DynamicField';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { DynamicFieldTypes } from '../../model/DynamicFieldTypes';
import { DynamicFieldProperty } from '../../model/DynamicFieldProperty';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { CheckListItem } from '../../model/CheckListItem';
import { DynamicFieldFormUtil } from '../../../base-components/webapp/core/DynamicFieldFormUtil';
import { ChecklistState } from '../../model/ChecklistState';
import { CheckListInputType } from '../../model/CheckListInputType';

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
                    dynamicField && formContext === FormContext.EDIT
                        ? dynamicField[f.property]
                        : f.defaultValue ? f.defaultValue.value : null,
                    dynamicField,
                    f, formContext
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

                if (dynamicField && f.property === DynamicFieldProperty.CONFIG) {

                    // do not overwrite original config
                    value = Object.assign({}, value);
                    if (dynamicField.FieldType === DynamicFieldTypes.SELECTION) {
                        const possibleValueArray = [];
                        if (value.PossibleValues) {
                            Object.keys(value.PossibleValues).forEach((key) => {
                                const newPossibleValues = {};
                                newPossibleValues['Key'] = key;
                                newPossibleValues['Value'] = value.PossibleValues[key];
                                possibleValueArray.push(newPossibleValues);
                            });
                        }
                        value.PossibleValues = possibleValueArray;
                        value.TranslatableValues = Boolean(value.TranslatableValues === '1');
                    } else if (dynamicField.FieldType === DynamicFieldTypes.CHECK_LIST) {
                        const checklist = JSON.parse(value.DefaultValue);
                        DynamicFieldFormService.prepareChecklistConfig(checklist);
                        value.DefaultValue = checklist;
                    }
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

    public static prepareChecklistConfig(checklist: CheckListItem[]): void {
        for (const ci of checklist) {
            if (ci.input === CheckListInputType.ChecklistState && !ci.inputStates?.length) {
                ci.inputStates = DynamicFieldFormUtil.getDefaultChecklistStates();
                ci.inputStates.forEach(((is) => is.order = 0));
            }

            if (!ci.sub) {
                ci.sub = [];
            } else {
                this.prepareChecklistConfig(ci.sub);
            }
        }
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {

        const fieldTypeParameter = parameter.find((p) => p[0] === DynamicFieldProperty.FIELD_TYPE);
        const configParameter = parameter.find((p) => p[0] === DynamicFieldProperty.CONFIG);

        if (configParameter) {
            configParameter[1] = { ...configParameter[1] };
            if (fieldTypeParameter[1] === DynamicFieldTypes.SELECTION) {
                configParameter[1].TranslatableValues = configParameter[1].TranslatableValues ? 1 : 0;
                const possibleValue = configParameter[1].PossibleValues ? configParameter[1].PossibleValues : [];
                const possibleValueHash = {};
                possibleValue.forEach((p) => possibleValueHash[p.Key] = p.Value);
                configParameter[1].PossibleValues = possibleValueHash;
            } else if (fieldTypeParameter[1] === DynamicFieldTypes.CHECK_LIST) {
                const checklist = configParameter[1].DefaultValue;
                DynamicFieldFormService.prepareChecklistConfig(checklist);
                configParameter[1].DefaultValue = JSON.stringify(checklist);
            }
        }

        const visibleParameter = parameter.find((p) => p[0] === DynamicFieldProperty.CUSTOMER_VISIBLE);
        if (visibleParameter) {
            visibleParameter[1] = Boolean(visibleParameter[1]);
        }

        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

}
