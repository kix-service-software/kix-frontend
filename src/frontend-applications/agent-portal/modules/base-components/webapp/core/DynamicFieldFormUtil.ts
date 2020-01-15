/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { IKIXObjectFormService } from "../../../base-components/webapp/core/IKIXObjectFormService";
import { DynamicFormFieldOption } from "../../../dynamic-fields/webapp/core/DynamicFormFieldOption";
import { DynamicFieldProperty } from "../../../dynamic-fields/model/DynamicFieldProperty";
import { DynamicField } from "../../../dynamic-fields/model/DynamicField";
import { DynamicFieldValue } from "../../../dynamic-fields/model/DynamicFieldValue";
import { InputFieldTypes } from "./InputFieldTypes";
import { FormFieldOptions } from "../../../../model/configuration/FormFieldOptions";
import { FormFieldOption } from "../../../../model/configuration/FormFieldOption";
import { DateTimeUtil } from "./DateTimeUtil";

export class DynamicFieldFormUtil {

    public static async configureDynamicFields(form: FormConfiguration): Promise<void> {
        for (const page of form.pages) {
            for (const group of page.groups) {
                const dynamicFields = group.formFields.filter((ff) => {
                    return ff.property === KIXObjectProperty.DYNAMIC_FIELDS &&
                        ff.options.some((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                });

                for (const df of dynamicFields) {
                    const success = await this.createDynamicFormField(df);
                    if (!success) {
                        const index = group.formFields.findIndex((f) => f.instanceId === df.instanceId);
                        group.formFields.splice(index, 1);
                    }
                }
            }
        }
    }

    private static async createDynamicFormField(field: FormFieldConfiguration): Promise<boolean> {
        let success = false;
        const nameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
        if (nameOption) {
            const name = nameOption.value;
            const loadingOptions = new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, name
                    )
                ],
                null, null, [DynamicFieldProperty.CONFIG]
            );
            const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
            );
            if (dynamicFields && dynamicFields.length && dynamicFields[0].ValidID === 1 && dynamicFields[0].Config) {
                const config = dynamicFields[0].Config;
                field.countDefault = Number(config.CountDefault);
                field.countMax = Number(config.CountMax);
                field.countMin = Number(config.CountMin);

                if (!field.label || field.label === '') {
                    field.label = dynamicFields[0].Label;
                }

                field.defaultValue = config.DefaultValue
                    ? new FormFieldValue(config.DefaultValue, true)
                    : null;

                if (dynamicFields[0].FieldType === 'Text') {
                    field.inputComponent = null;
                } else if (dynamicFields[0].FieldType === 'TextArea') {
                    field.inputComponent = 'text-area-input';
                } else if (dynamicFields[0].FieldType === 'Date' || dynamicFields[0].FieldType === 'DateTime') {

                    const date = new Date();
                    let type = InputFieldTypes.DATE_TIME;

                    const offset = config.DefaultValue ? Number(config.DefaultValue) : 0;

                    if (dynamicFields[0].FieldType === 'Date') {
                        type = InputFieldTypes.DATE;
                        date.setDate(date.getDate() + offset);
                        date.setHours(0, 0, 0, 0);
                    } else {
                        date.setSeconds(date.getSeconds() + offset);
                    }

                    field.options.push(
                        new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, type),
                    );

                    const yearsInPast = Number(config.YearsInPast);
                    if (yearsInPast && yearsInPast > 0) {
                        const pastDate = new Date();
                        pastDate.setFullYear(pastDate.getFullYear() - yearsInPast);
                        field.options.push(
                            new FormFieldOption(FormFieldOptions.MIN_DATE, DateTimeUtil.getKIXDateString(pastDate)),
                        );
                    }

                    const yearsInFuture = Number(config.YearsInFuture);
                    if (yearsInFuture && yearsInFuture > 0) {
                        const futureDate = new Date();
                        futureDate.setFullYear(futureDate.getFullYear() + yearsInFuture);
                        field.options.push(
                            new FormFieldOption(FormFieldOptions.MAX_DATE, DateTimeUtil.getKIXDateString(futureDate)),
                        );
                    }

                    field.defaultValue = new FormFieldValue(date);
                    field.inputComponent = 'date-time-input';
                }

                success = true;
            }
        }

        return success;
    }

    public static handleDynamicFieldValues(
        formFields: FormFieldConfiguration[], object: KIXObject, formService: IKIXObjectFormService
    ): void {
        if (object && object.DynamicFields && object.DynamicFields.length) {
            const fields = [...formFields].filter((f) => f.property === KIXObjectProperty.DYNAMIC_FIELDS);
            for (const field of fields) {
                let values = [];
                const fieldNameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                if (fieldNameOption) {
                    const dfValue: DynamicFieldValue = object.DynamicFields.find(
                        (df) => df.Name === fieldNameOption.value
                    );
                    if (dfValue) {
                        values = dfValue.Value;
                    }
                }

                for (let i = 0; i < values.length; i++) {
                    if (i === 0) {
                        field.defaultValue = new FormFieldValue(values[i], true);
                    } else {
                        const newField = formService.getNewFormField(field);
                        newField.defaultValue = new FormFieldValue(values[i], true);
                        const index = formFields.findIndex((f) => field.instanceId === f.instanceId);
                        formFields.splice(index + i, 0, newField);
                    }
                }

                if (field.countMin > 0 && values.length < field.countMin) {
                    const countDefault = field.countDefault > field.countMin && field.countDefault < field.countMax
                        ? field.countDefault
                        : field.countMin;
                    const count = values.length === 0 ? countDefault : field.countMin - values.length;

                    for (let i = 1; i < count; i++) {
                        const newField = formService.getNewFormField(field);
                        newField.defaultValue = new FormFieldValue(null, false);
                        const index = formFields.findIndex((f) => field.instanceId === f.instanceId);
                        formFields.splice(index, 0, newField);
                    }
                }
            }
        }
    }

    public static async handleDynamicField(
        field: FormFieldConfiguration, value: FormFieldValue, parameter: Array<[string, any]>
    ): Promise<Array<[string, any]>> {
        let dfParameter = parameter.find((p) => p[0] === KIXObjectProperty.DYNAMIC_FIELDS);
        if (!dfParameter) {
            dfParameter = [KIXObjectProperty.DYNAMIC_FIELDS, []];
            parameter.push(dfParameter);
        }

        const fieldNameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
        if (fieldNameOption) {

            const loadingOptions = new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        DynamicFieldProperty.NAME, SearchOperator.EQUALS,
                        FilterDataType.STRING, FilterType.AND, fieldNameOption.value
                    )
                ]
            );
            const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
            );

            let setValue = value.value;

            if (dynamicFields && dynamicFields.length) {
                const fieldType = dynamicFields[0].FieldType;
                if (fieldType === 'Date' || fieldType === 'DateTime') {
                    setValue = DateTimeUtil.getKIXDateTimeString(setValue);
                }
            }

            let dfValue = dfParameter[1].find((p) => p.Name === fieldNameOption.value);
            if (!dfValue) {
                dfValue = {
                    Name: fieldNameOption.value,
                    Value: []
                };
                dfParameter[1].push(dfValue);
            }

            if (!dfValue.Value.some((v) => v === setValue)) {
                dfValue.Value.push(setValue);
            }
        }

        return parameter;
    }

}
