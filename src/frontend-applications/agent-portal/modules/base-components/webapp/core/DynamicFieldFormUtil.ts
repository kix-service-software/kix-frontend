/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core/DynamicFormFieldOption';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { InputFieldTypes } from './InputFieldTypes';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { DateTimeUtil } from './DateTimeUtil';
import { ObjectReferenceOptions } from './ObjectReferenceOptions';
import { TreeNode } from './tree';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { FormValidationService } from './FormValidationService';
import { ValidationResult } from './ValidationResult';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { CheckListInputType } from '../../../dynamic-fields/webapp/core/CheckListInputType';
import { CheckListItem } from '../../../dynamic-fields/webapp/core/CheckListItem';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterType } from '../../../../model/FilterType';
import { FilterDataType } from '../../../../model/FilterDataType';
import { ConfigItemProperty } from '../../../cmdb/model/ConfigItemProperty';
import { KIXObjectService } from './KIXObjectService';
import { IDynamicFieldFormUtil } from './IDynamicFieldFormUtil';
import { ExtendedDynamicFieldFormUtil } from './ExtendedDynamicFieldFormUtil';
import { KIXObjectFormService } from './KIXObjectFormService';

export class DynamicFieldFormUtil implements IDynamicFieldFormUtil {

    private static INSTANCE: DynamicFieldFormUtil;

    public static getInstance(): DynamicFieldFormUtil {
        if (!DynamicFieldFormUtil.INSTANCE) {
            DynamicFieldFormUtil.INSTANCE = new DynamicFieldFormUtil();
        }
        return DynamicFieldFormUtil.INSTANCE;
    }

    private constructor() { }

    private extendedUtils: ExtendedDynamicFieldFormUtil[] = [];

    public addExtendedDynamicFormUtil(util: ExtendedDynamicFieldFormUtil): void {
        this.extendedUtils.push(util);
    }

    public async configureDynamicFields(form: FormConfiguration): Promise<void> {
        for (const page of form.pages) {
            for (const group of page.groups) {
                const dynamicFields = group.formFields.filter((ff) => {
                    return ff.property === KIXObjectProperty.DYNAMIC_FIELDS &&
                        ff.options.some((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                });

                for (const df of dynamicFields) {
                    const success = await this.createDynamicFormField(df, form.objectType);
                    if (!success) {
                        const index = group.formFields.findIndex((f) => f.instanceId === df.instanceId);
                        group.formFields.splice(index, 1);
                    }
                }
            }
        }
    }

    public async createDynamicFormField(
        field: FormFieldConfiguration, objectType?: KIXObjectType | string
    ): Promise<boolean> {
        let success = false;
        const nameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
        if (nameOption) {
            const name = nameOption.value;
            const dynamicField = await KIXObjectService.loadDynamicField(name);
            if (dynamicField && dynamicField.ValidID === 1) {
                if (objectType && dynamicField.ObjectType !== objectType) {
                    return;
                }

                const config = dynamicField.Config;
                field.countDefault = Number(config.CountDefault);
                field.countMax = Number(config.CountMax);
                field.countMin = Number(config.CountMin);

                if (!field.label || field.label === '') {
                    field.label = dynamicField.Label;
                }

                field.defaultValue = !field.defaultValue && config.DefaultValue
                    ? new FormFieldValue(config.DefaultValue, true)
                    : field.defaultValue;

                switch (dynamicField.FieldType) {
                    case DynamicFieldTypes.TEXT:
                        field.inputComponent = null;
                        break;
                    case DynamicFieldTypes.TEXT_AREA:
                        field.inputComponent = 'text-area-input';
                        break;
                    case DynamicFieldTypes.DATE:
                    case DynamicFieldTypes.DATE_TIME:
                        this.prepareDateField(field, dynamicField);
                        break;
                    case DynamicFieldTypes.SELECTION:
                        await this.prepareSelectionField(field, dynamicField);
                        break;
                    case DynamicFieldTypes.CHECK_LIST:
                        this.prepareChecklistField(field, dynamicField);
                        break;
                    case DynamicFieldTypes.CI_REFERENCE:
                        this.prepareCIReferenceField(field, dynamicField);
                        break;
                    case DynamicFieldTypes.TABLE:
                        this.prepareTableField(field, dynamicField);
                        break;
                    default:
                        for (const extendedUtil of this.extendedUtils) {
                            await extendedUtil.createDynamicFormField(field, objectType);
                        }
                }

                success = true;
            }
        }

        return success;
    }

    public prepareDateField(field: FormFieldConfiguration, dynamicField: DynamicField): void {
        const date = new Date();
        let type = InputFieldTypes.DATE_TIME;

        const offset = dynamicField.Config.DefaultValue ? Number(dynamicField.Config.DefaultValue) : 0;

        if (dynamicField.FieldType === DynamicFieldTypes.DATE) {
            type = InputFieldTypes.DATE;
            date.setDate(date.getDate() + offset);
            date.setHours(0, 0, 0, 0);
        } else {
            date.setSeconds(date.getSeconds() + offset);
        }

        field.options.push(
            new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, type),
        );

        field.defaultValue = new FormFieldValue(date);
        field.inputComponent = 'date-time-input';
    }

    private async prepareSelectionField(
        field: FormFieldConfiguration, dynamicField: DynamicField
    ): Promise<void> {
        field.inputComponent = 'object-reference-input';
        const nodes: TreeNode[] = [];

        if (dynamicField.Config.PossibleValues) {
            const translatable = Number(dynamicField.Config.TranslatableValues);
            for (const pv in dynamicField.Config.PossibleValues) {
                if (dynamicField.Config.PossibleValues[pv]) {
                    const value = dynamicField.Config.PossibleValues[pv];
                    const label = translatable
                        ? await TranslationService.translate(value)
                        : value;
                    const node = new TreeNode(pv, label);
                    nodes.push(node);
                }
            }
        }

        field.options.push(new FormFieldOption(ObjectReferenceOptions.ADDITIONAL_NODES, nodes));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.COUNT_MIN, field.countMin));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.COUNT_MAX, field.countMax));

        const isMultiSelect = field.countMax !== null && (field.countMax < 0 || field.countMax > 1);
        field.options.push(new FormFieldOption(ObjectReferenceOptions.MULTISELECT, isMultiSelect));

        if (field.countMin > 0) {
            field.required = true;
        }

        field.countDefault = 1;
        field.countMax = 1;
        field.countMin = 1;
    }

    private prepareChecklistField(field: FormFieldConfiguration, dynamicField: DynamicField): void {
        field.inputComponent = 'dynamic-field-checklist-input';
        field.defaultValue = new FormFieldValue(
            dynamicField.Config.DefaultValue ? JSON.parse(dynamicField.Config.DefaultValue) : null
        );
        field.countDefault = 1;
        field.countMax = 1;
        field.countMin = 1;
    }

    private prepareTableField(field: FormFieldConfiguration, dynamicField: DynamicField): void {
        field.inputComponent = 'dynamic-field-table-input';
        field.countDefault = 1;
        field.countMax = 1;
        field.countMin = 1;
    }

    private prepareCIReferenceField(field: FormFieldConfiguration, dynamicField: DynamicField): void {
        field.inputComponent = 'object-reference-input';
        const isMultiSelect = field.countMax !== null && (field.countMax < 0 || field.countMax > 1);

        const filter = [
            new FilterCriteria(
                ConfigItemProperty.NUMBER, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, SearchProperty.SEARCH_VALUE
            ),
            new FilterCriteria(
                ConfigItemProperty.NAME, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, SearchProperty.SEARCH_VALUE
            )
        ];

        if (dynamicField.Config) {
            const classes = dynamicField.Config.ITSMConfigItemClasses;
            if (classes && Array.isArray(classes) && classes.length) {
                filter.push(new FilterCriteria(
                    ConfigItemProperty.CLASS_ID, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, classes.map((c) => Number(c))
                ));
            }

            const depStates = dynamicField.Config.DeploymentStates;
            if (depStates && Array.isArray(depStates) && depStates.length) {
                filter.push(new FilterCriteria(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, depStates.map((d) => Number(d))
                ));
            }
        }

        field.options.push(new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.CONFIG_ITEM));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.MULTISELECT, isMultiSelect));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true));
        field.options.push(new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE));
        field.options.push(
            new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS, new KIXObjectLoadingOptions(filter))
        );
        field.options.push(new FormFieldOption(ObjectReferenceOptions.COUNT_MIN, field.countMin));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.COUNT_MAX, field.countMax));

        field.defaultValue = new FormFieldValue(
            dynamicField.Config.DefaultValue ? JSON.parse(dynamicField.Config.DefaultValue) : null
        );

        field.countDefault = 1;
        field.countMax = 1;
        field.countMin = 1;
    }

    public async handleDynamicFieldValues(
        formFields: FormFieldConfiguration[], object: KIXObject, formService: KIXObjectFormService,
        formFieldValues: Map<string, FormFieldValue<any>>, objectType: KIXObjectType | string
    ): Promise<void> {
        const fields = [...formFields].filter((f) => f.property === KIXObjectProperty.DYNAMIC_FIELDS);
        for (const field of fields) {
            let dfValue;
            const fieldNameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
            let dynamicField: DynamicField;
            if (fieldNameOption) {
                if (object && object.DynamicFields && object.DynamicFields.length) {
                    const objectDFValue: DynamicFieldValue = object.DynamicFields.find(
                        (df) => df.Name === fieldNameOption.value
                    );
                    if (objectDFValue) {
                        dfValue = objectDFValue.Value;
                        if (Array.isArray(dfValue) && dfValue.length === 0 && field.defaultValue) {
                            dfValue.push(field.defaultValue.value);
                        }
                    }
                }

                dynamicField = await KIXObjectService.loadDynamicField(fieldNameOption.value);
            }

            if (dynamicField && dynamicField.ObjectType === objectType) {
                if (
                    (typeof dfValue === 'undefined' || dfValue === null) &&
                    typeof dynamicField.Config === 'object' &&
                    dynamicField.Config.DefaultValue
                ) {
                    if (dynamicField.FieldType === DynamicFieldTypes.DATE ||
                        dynamicField.FieldType === DynamicFieldTypes.DATE_TIME
                    ) {
                        dfValue = new Date();
                        const offset = dynamicField.Config.DefaultValue ? Number(dynamicField.Config.DefaultValue) : 0;
                        if (dynamicField.FieldType === DynamicFieldTypes.DATE) {
                            dfValue.setDate(dfValue.getDate() + offset);
                            dfValue.setHours(0, 0, 0, 0);
                        } else {
                            dfValue.setSeconds(dfValue.getSeconds() + offset);
                        }
                    } else {
                        dfValue = dynamicField.Config.DefaultValue;
                    }
                }

                let extendedUtilResult: boolean = false;
                for (const util of this.extendedUtils) {
                    extendedUtilResult = await util.setFieldValue(dynamicField, dfValue, field);
                }

                if (extendedUtilResult) {
                    continue;
                }

                if (dynamicField.FieldType === DynamicFieldTypes.SELECTION ||
                    dynamicField.FieldType === DynamicFieldTypes.CI_REFERENCE
                ) {
                    formFieldValues.set(field.instanceId, new FormFieldValue(dfValue));
                } else if (dynamicField.FieldType === DynamicFieldTypes.CHECK_LIST) {
                    if (dfValue) {
                        let checklist = JSON.parse(dfValue);
                        if (typeof checklist === 'string') {
                            checklist = JSON.parse(checklist);
                        }
                        formFieldValues.set(field.instanceId, new FormFieldValue(checklist));
                    }
                } else if (dfValue && Array.isArray(dfValue)) {
                    for (let i = 0; i < dfValue.length; i++) {
                        if (i === 0) {
                            formFieldValues.set(field.instanceId, new FormFieldValue(dfValue[i]));
                        } else {
                            const newField = await formService.getNewFormField(null, field);
                            formFieldValues.set(newField.instanceId, new FormFieldValue(dfValue[i]));
                            const index = formFields.findIndex((f) => field.instanceId === f.instanceId);
                            formFields.splice(index + i, 0, newField);
                        }
                    }

                    if (field.countMin > 0 && dfValue.length < field.countMin) {
                        const countDefault = field.countDefault > field.countMin && field.countDefault < field.countMax
                            ? field.countDefault
                            : field.countMin;
                        const count = dfValue.length === 0 ? countDefault : field.countMin - dfValue.length;

                        for (let i = 1; i < count; i++) {
                            const newField = await formService.getNewFormField(null, field);
                            formFieldValues.set(newField.instanceId, new FormFieldValue(null, false));
                            const index = formFields.findIndex((f) => field.instanceId === f.instanceId);
                            formFields.splice(index, 0, newField);
                        }
                    } else if (field.countMin === 0 && !dfValue.length) {
                        field.empty = true;
                    }
                } else {
                    formFieldValues.set(field.instanceId, new FormFieldValue(dfValue));
                }
            }
        }
    }

    public async handleDynamicField(
        field: FormFieldConfiguration, value: FormFieldValue, parameter: Array<[string, any]>
    ): Promise<Array<[string, any]>> {
        const fieldNameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
        if (fieldNameOption) {
            const setValue = field.empty ? null : value.value;
            await this.setDFParameterValue(fieldNameOption.value, setValue, parameter);
        }
        return parameter;
    }

    public async handleDynamicFieldByProperty(
        property: string, value: FormFieldValue, parameter: Array<[string, any]>
    ): Promise<Array<[string, any]>> {
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfName);
            if (dynamicField) {
                const setValue = value ? value.value : null;
                await this.setDFParameterValue(dfName, setValue, parameter);
            }
        }
        return parameter;
    }

    private async setDFParameterValue(dfName: string, value: any, parameter: Array<[string, any]>): Promise<void> {
        let dfParameter = parameter.find((p) => p[0] === KIXObjectProperty.DYNAMIC_FIELDS);
        if (!dfParameter) {
            dfParameter = [KIXObjectProperty.DYNAMIC_FIELDS, []];
            parameter.push(dfParameter);
        }

        let notArray = false;
        const dynamicField = await KIXObjectService.loadDynamicField(dfName);
        if (dynamicField) {
            const fieldType = dynamicField.FieldType;
            if (value && (fieldType === DynamicFieldTypes.DATE || fieldType === DynamicFieldTypes.DATE_TIME)) {
                value = DateTimeUtil.getKIXDateTimeString(value);
            } else if (value && fieldType === DynamicFieldTypes.CHECK_LIST) {
                value = JSON.stringify(value);
                notArray = true;
            }
        }

        let dfValue = dfParameter[1].find((p) => p.Name === dfName);
        if (!dfValue) {
            dfValue = {
                Name: dfName,
                Value: []
            };
            dfParameter[1].push(dfValue);
        }

        if (notArray || Array.isArray(value)) {
            dfValue.Value = value;
        } else if (value && !dfValue.Value.some((v) => v === value)) {
            dfValue.Value.push(value);
        }
    }

    public async validateDFValue(dfName: string, value: any): Promise<ValidationResult[]> {
        let result = [];
        const dynamicField = await KIXObjectService.loadDynamicField(dfName);
        if (dynamicField) {
            const dfResult = await FormValidationService.getInstance().validateDynamicFieldValue(dynamicField, value);
            result = [...result, ...dfResult];
        }
        return result;
    }

    public countValues(checklist: CheckListItem[]): [number, number] {
        const value: [number, number] = [0, 0];
        for (const item of checklist) {
            if (item.input === CheckListInputType.ChecklistState) {
                value[1]++;

                if (!item.value) {
                    item.value = '-';
                }

                if (item.value === 'OK' || item.value === 'NOK' || item.value === 'n.a.') {
                    value[0]++;
                }
            }

            if (item.sub && item.sub.length) {
                const subCount = this.countValues(item.sub);
                value[0] = value[0] + subCount[0];
                value[1] = value[1] + subCount[1];
            }
        }

        return value;
    }

}
