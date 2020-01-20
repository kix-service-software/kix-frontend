/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractDynamicFormManager
} from "../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { PropertyOperator } from "../../../../modules/base-components/webapp/core/PropertyOperator";
import { PropertyOperatorUtil } from "../../../../modules/base-components/webapp/core/PropertyOperatorUtil";
import { ObjectPropertyValue } from "../../../../model/ObjectPropertyValue";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { DynamicField } from "../../../dynamic-fields/model/DynamicField";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../../dynamic-fields/model/DynamicFieldProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { DynamicFieldFormUtil } from "../../../base-components/webapp/core/DynamicFieldFormUtil";
import { ValidationSeverity } from "../../../base-components/webapp/core/ValidationSeverity";
import { ValidationResult } from "../../../base-components/webapp/core/ValidationResult";
import { InputFieldTypes } from "../../../base-components/webapp/core/InputFieldTypes";

export abstract class BulkManager extends AbstractDynamicFormManager {

    public abstract objectType: KIXObjectType | string = KIXObjectType.ANY;
    public objects: KIXObject[] = [];

    private bulkRun: boolean = false;

    public init(): void {
        super.init();
        this.bulkRun = false;
    }

    public getBulkRunState() {
        return this.bulkRun;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties = [];
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, this.objectType
                ),
                new FilterCriteria(
                    DynamicFieldProperty.FIELD_TYPE, SearchOperator.IN,
                    FilterDataType.STRING, FilterType.AND,
                    [
                        'Text', 'TextArea', 'Date', 'DateTime', 'Multiselect'
                    ]
                ),
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, 1
                )
            ]
        );
        const fields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        );

        if (fields) {
            for (const field of fields) {
                properties.push([KIXObjectProperty.DYNAMIC_FIELDS + '.' + field.Name, field.Label]);
            }
        }

        return properties;
    }

    public async getOperations(property: string): Promise<PropertyOperator[]> {
        return [
            PropertyOperator.CHANGE,
            PropertyOperator.CLEAR
        ];
    }

    public async getOperatorDisplayText(operator: PropertyOperator): Promise<string> {
        return PropertyOperatorUtil.getText(operator);
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return Boolean(value.property && value.operator && value.operator !== PropertyOperator.CLEAR);
    }

    public async execute(object: KIXObject): Promise<void> {
        if (this.getEditableValues().some((v) => !v.valid)) {
            return;
        }

        this.bulkRun = true;
        const parameter: Array<[string, any]> = [];

        const values = this.getEditableValues().filter(
            (v) => !v.property.match(new RegExp(KIXObjectProperty.DYNAMIC_FIELDS + '?\.(.+)'))
        );

        for (const v of values) {
            const isMultiSelect = await this.isMultiselect(v.property);
            parameter.push([
                v.property,
                v.operator === PropertyOperator.CLEAR
                    ? null
                    : !isMultiSelect && Array.isArray(v.value) ? v.value[0] : v.value
            ]);
        }

        const dfObjectValues = [];
        const dynamicFieldValues = this.values.filter(
            (v) => v.property.match(new RegExp(KIXObjectProperty.DYNAMIC_FIELDS + '?\.(.+)'))
        );
        for (const dfValue of dynamicFieldValues) {
            const dfName = this.getDynamicFieldName(dfValue.property);
            let value = dfObjectValues.find((v) => v.Name === dfName);
            if (!value) {
                value = {
                    Name: dfName,
                    Value: []
                };
                dfObjectValues.push(value);
            }
            if (dfValue.operator === PropertyOperator.CLEAR) {
                value.Value = null;
            } else if (Array.isArray(dfValue.value)) {
                value.Value = dfValue.value;
            } else if (!value.Value.some((v) => v === dfValue.value)) {
                value.Value.push(dfValue.value);
            }
        }

        if (dfObjectValues.length) {
            parameter.push([KIXObjectProperty.DYNAMIC_FIELDS, dfObjectValues]);
        }

        await KIXObjectService.updateObject(this.objectType, parameter, object.ObjectId, false);
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.values.filter(
            (bv) => bv.operator === PropertyOperator.CLEAR
                || bv.property !== null && bv.value !== null && bv.value !== undefined
        )];
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return await this.getInputTypeForDF(property);
    }

    public async isMultiselect(property: string): Promise<boolean> {
        let isMultiSelect = false;
        const field = await this.loadDynamicField(property);
        if (field && field.FieldType === 'Multiselect' && field.Config && field.Config.CountMax > 1) {
            isMultiSelect = true;
        }
        return isMultiSelect;
    }

    protected async getInputTypeForDF(property: string): Promise<InputFieldTypes> {
        let inputFieldType = InputFieldTypes.TEXT;
        const field = await this.loadDynamicField(property);
        if (field) {
            if (field.FieldType === 'TextArea') {
                inputFieldType = InputFieldTypes.TEXT_AREA;
            } else if (field.FieldType === 'Date') {
                inputFieldType = InputFieldTypes.DATE;
            } else if (field.FieldType === 'DateTime') {
                inputFieldType = InputFieldTypes.DATE_TIME;
            } else if (field.FieldType === 'Multiselect') {
                inputFieldType = InputFieldTypes.DROPDOWN;
            }
        }
        return inputFieldType;
    }

    public async validate(): Promise<ValidationResult[]> {
        const dfValues = this.values.filter((v) => this.getDynamicFieldName(v.property));
        let validationResult: ValidationResult[] = [];
        for (const v of dfValues) {
            const result = await DynamicFieldFormUtil.validateDFValue(this.getDynamicFieldName(v.property), v.value);
            v.valid = !result.some((r) => r.severity === ValidationSeverity.ERROR);
            validationResult = [...validationResult, ...result];
        }

        return validationResult;
    }

    protected async loadDynamicField(property: string): Promise<DynamicField> {
        let dynamicField: DynamicField;
        const name = this.getDynamicFieldName(property);
        if (name) {
            const loadingOptions = new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        DynamicFieldProperty.NAME, SearchOperator.EQUALS,
                        FilterDataType.STRING, FilterType.AND, name
                    )
                ], null, null, [DynamicFieldProperty.CONFIG]
            );
            const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
            );

            dynamicField = dynamicFields && dynamicFields.length ? dynamicFields[0] : null;
        }
        return dynamicField;
    }

    public getDynamicFieldName(property: string): string {
        let dfName: string;
        const dFRegEx = new RegExp(KIXObjectProperty.DYNAMIC_FIELDS + '?\.(.+)');
        if (property.match(dFRegEx)) {
            dfName = property.replace(dFRegEx, '$1');
        }
        return dfName;
    }
}
