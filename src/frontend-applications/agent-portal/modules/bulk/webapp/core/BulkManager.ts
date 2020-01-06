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
import { InputFieldTypes } from "../../../../modules/base-components/webapp/core/InputFieldTypes";
import { ObjectPropertyValue } from "../../../../model/ObjectPropertyValue";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";

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
        return [];
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

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return InputFieldTypes.TEXT;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return Boolean(value.property && value.operator && value.operator !== PropertyOperator.CLEAR);
    }

    public async execute(object: KIXObject): Promise<void> {
        this.bulkRun = true;
        const parameter: Array<[string, any]> = [];

        const values = this.getEditableValues();
        values.forEach((v) => parameter.push(
            [
                v.property,
                v.operator === PropertyOperator.CLEAR ? null
                    : !this.isMultiselect(v.property) && Array.isArray(v.value) ? v.value[0] : v.value
            ]
        ));
        await KIXObjectService.updateObject(this.objectType, parameter, object.ObjectId, false);
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.values.filter(
            (bv) => bv.operator === PropertyOperator.CLEAR
                || bv.property !== null && bv.value !== null && bv.value !== undefined
        )];
    }
}
