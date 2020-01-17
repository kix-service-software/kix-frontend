/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDynamicFormManager } from "./IDynamicFormManager";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ObjectPropertyValue } from "../../../../../model/ObjectPropertyValue";
import { InputFieldTypes } from "../InputFieldTypes";
import { TreeNode } from "../tree";
import { DynamicFormOperationsType } from "./DynamicFormOperationsType";
import { ValidationResult } from "../ValidationResult";

export abstract class AbstractDynamicFormManager implements IDynamicFormManager {

    public abstract objectType: KIXObjectType | string = KIXObjectType.ANY;

    protected values: ObjectPropertyValue[] = [];

    protected listeners: Map<string, () => void> = new Map();

    public uniqueProperties: boolean = true;

    public abstract async getProperties(): Promise<Array<[string, string]>>;

    public registerListener(listenerId: string, callback: () => void): void {
        if (listenerId) {
            this.listeners.set(listenerId, callback);
        }
    }

    public unregisterListener(listenerId: string): void {
        if (listenerId) {
            this.listeners.delete(listenerId);
        }
    }

    protected notifyListeners(): void {
        this.listeners.forEach((listener: () => void) => listener());
    }

    public init(): void {
        return;
    }

    public reset(notify: boolean = true): void {
        this.values = [];
        if (notify) {
            this.notifyListeners();
        }
    }

    public hasDefinedValues(): boolean {
        return !!this.getEditableValues().length;
    }

    public async setValue(newValue: ObjectPropertyValue): Promise<void> {
        const index = this.values.findIndex((bv) => bv.id === newValue.id);
        if (index !== -1) {
            this.values[index].property = newValue.property;
            this.values[index].operator = newValue.operator;
            this.values[index].value = newValue.value;
            this.values[index].required = newValue.required;
        } else {
            this.values.push(newValue);
        }

        await this.checkProperties();
        await this.validate();
        this.notifyListeners();
    }

    public async removeValue(importValue: ObjectPropertyValue): Promise<void> {
        const index = this.values.findIndex((bv) => bv.id === importValue.id);
        if (index !== -1) {
            this.values.splice(index, 1);
        }

        await this.checkProperties();
        await this.validate();
        this.notifyListeners();
    }

    protected async checkProperties(): Promise<void> {
        return;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return Boolean(value.property && value.operator);
    }

    public getValues(): ObjectPropertyValue[] {
        return this.values;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return;
    }

    public async getObjectReferenceObjectType(property: string): Promise<KIXObjectType | string> {
        return;
    }

    public getSpecificInput(): string {
        return;
    }

    public async getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        return [];
    }

    public async isHiddenProperty(property: string): Promise<boolean> {
        return false;
    }


    public async getPropertiesPlaceholder(): Promise<string> {
        return '';
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return [];
    }

    public hasValueForProperty(property: string): boolean {
        return this.values.some((bv) => bv.property === property);
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return '';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return;
    }

    public async getOperatorDisplayText(operator: string): Promise<string> {
        return operator;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        return [];
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.values];
    }

    public async clearValueOnPropertyChange(property: string): Promise<boolean> {
        return true;
    }

    public async isMultiselect(property: string): Promise<boolean> {
        return false;
    }

    public validate(): Promise<ValidationResult[]> {
        return;
    }

    public async shouldAddEmptyField(): Promise<boolean> {
        let addEmpty: boolean = false;
        if (this.uniqueProperties) {
            const properties = await this.getProperties();
            let visiblePropertiesCount = 0;
            for (const p of properties) {
                if (!await this.isHiddenProperty(p[0])) {
                    visiblePropertiesCount++;
                }
            }
            addEmpty = this.values.length < visiblePropertiesCount;
        } else {
            addEmpty = true;
        }
        return addEmpty;
    }

}
