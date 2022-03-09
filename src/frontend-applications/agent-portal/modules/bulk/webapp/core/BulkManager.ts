/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { PropertyOperator } from '../../../../modules/base-components/webapp/core/PropertyOperator';
import { PropertyOperatorUtil } from '../../../../modules/base-components/webapp/core/PropertyOperatorUtil';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { DynamicFieldFormUtil } from '../../../base-components/webapp/core/DynamicFieldFormUtil';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';

export abstract class BulkManager extends AbstractDynamicFormManager {

    public abstract objectType: KIXObjectType | string;
    public objects: KIXObject[] = [];

    private bulkRun: boolean = false;

    public init(): void {
        super.init();
        this.bulkRun = false;
    }

    public getBulkRunState(): boolean {
        return this.bulkRun;
    }

    public async getOperations(property: string): Promise<PropertyOperator[]> {
        return [
            PropertyOperator.CHANGE,
            PropertyOperator.CLEAR
        ];
    }

    public getOperatorDisplayText(operator: PropertyOperator): Promise<string> {
        return PropertyOperatorUtil.getText(operator);
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return Boolean(value.property && value.operator && value.operator !== PropertyOperator.CLEAR);
    }

    public async getEditableValues(): Promise<ObjectPropertyValue[]> {
        return [...this.values.filter(
            (bv) => bv.operator === PropertyOperator.CLEAR
                || bv.property !== null && bv.value !== null && bv.value !== undefined
        )];
    }

    public async validate(): Promise<ValidationResult[]> {
        const dfValues = this.values.filter((v) => KIXObjectService.getDynamicFieldName(v.property));
        let validationResult: ValidationResult[] = [];
        for (const v of dfValues) {
            const result = await DynamicFieldFormUtil.getInstance().validateDFValue(
                KIXObjectService.getDynamicFieldName(v.property), v.value
            );
            v.valid = !result.some((r) => r.severity === ValidationSeverity.ERROR);
            validationResult = [...validationResult, ...result];
        }

        return validationResult;
    }

    public async isMultiselect(property: string, operator: SearchOperator | string): Promise<boolean> {
        const result = await super.isMultiselect(property, operator);
        if (result !== null && typeof result !== 'undefined') {
            return result;
        }
        return false;
    }

    public async prepareParameter(): Promise<Array<[string, any]>> {
        const edTableValues = await this.getEditableValues();
        if (edTableValues.some((v) => !v.valid)) {
            return;
        }

        const parameter: Array<[string, any]> = [];

        const values = edTableValues.filter(
            (v) => !v.property.match(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`))
        );

        for (const v of values) {
            const isMultiSelect = await this.isMultiselect(v.property, v.operator);
            const value = v.operator === PropertyOperator.CLEAR
                ? null
                : !isMultiSelect && Array.isArray(v.value) ? v.value[0] : v.value;
            parameter.push([v.property, value]);
        }

        const dfObjectValues = [];
        const dynamicFieldValues = edTableValues.filter(
            (v) => v.property.match(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`))
        );
        for (const dfValue of dynamicFieldValues) {
            const dfName = KIXObjectService.getDynamicFieldName(dfValue.property);
            let value = dfObjectValues.find((v) => v.Name === dfName);
            if (!value) {
                value = {
                    Name: dfName,
                    Value: []
                };
                dfObjectValues.push(value);
            }
            if (dfValue.operator === PropertyOperator.CLEAR) {
                value.Value = [];
            } else if (Array.isArray(dfValue.value)) {
                value.Value = dfValue.value;
            } else if (!value.Value.some((v) => v === dfValue.value)) {
                value.Value.push(dfValue.value);
            }
        }

        if (dfObjectValues.length) {
            parameter.push([KIXObjectProperty.DYNAMIC_FIELDS, dfObjectValues]);
        }

        return parameter;
    }
}
