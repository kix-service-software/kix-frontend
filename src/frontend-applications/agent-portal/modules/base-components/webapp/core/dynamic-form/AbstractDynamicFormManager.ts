/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { AuthenticationSocketClient } from "../AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../server/model/rest/CRUD";
import { ValidationResult } from "../ValidationResult";
import { DynamicFieldTypes } from "../../../../dynamic-fields/model/DynamicFieldTypes";
import { KIXObjectService } from "../KIXObjectService";
import { ExtendedDynamicFormManager } from "./ExtendedDynamicFormManager";

export abstract class AbstractDynamicFormManager implements IDynamicFormManager {

    public abstract objectType: KIXObjectType | string = KIXObjectType.ANY;

    protected values: ObjectPropertyValue[] = [];

    protected listeners: Map<string, () => void> = new Map();

    public uniqueProperties: boolean = true;

    protected readPermissions: Map<string, boolean> = new Map();

    public resetOperator: boolean = true;

    public abstract async getProperties(): Promise<Array<[string, string]>>;

    protected extendedFormManager: ExtendedDynamicFormManager[] = [];

    public addExtendedFormManager(manager: ExtendedDynamicFormManager): void {
        this.extendedFormManager.push(manager);
    }

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

    public async getObjectReferenceObjectType(property: string): Promise<KIXObjectType | string> {
        for (const extendedManager of this.extendedFormManager) {
            const result = extendedManager.getObjectReferenceObjectType(property);
            if (result) {
                return result;
            }
        }
        return null;
    }

    public getSpecificInput(): string {
        for (const extendedManager of this.extendedFormManager) {
            const result = extendedManager.getSpecificInput();
            if (result) {
                return result;
            }
        }
        return null;
    }

    public async getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getInputTypeOptions(property, operator);
            if (result) {
                return result;
            }
        }
        return [];
    }

    public async isHiddenProperty(property: string): Promise<boolean> {
        return false;
    }


    public async getPropertiesPlaceholder(): Promise<string> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getPropertiesPlaceholder();
            if (result) {
                return result;
            }
        }
        return '';
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getTreeNodes(property);
            if (result) {
                return result;
            }
        }
        return [];
    }

    public hasValueForProperty(property: string): boolean {
        return this.values.some((bv) => bv.property === property);
    }

    public async getOperations(property: string): Promise<any[]> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getOperations(property);
            if (result) {
                return result;
            }
        }
        return [];
    }

    public async getOperationsPlaceholder(): Promise<string> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getOperationsPlaceholder();
            if (result) {
                return result;
            }
        }
        return '';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getOpertationsType(property);
            if (result) {
                return result;
            }
        }
        return null;
    }

    public async getOperatorDisplayText(operator: string): Promise<string> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getOperatorDisplayText(operator);
            if (result) {
                return result;
            }
        }

        return operator;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        for (const extendedManager of this.extendedFormManager) {
            const tree = await extendedManager.searchValues(property, searchValue, limit);
            if (tree) {
                return tree;
            }
        }

        return null;
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.values];
    }

    public async clearValueOnPropertyChange(property: string): Promise<boolean> {
        return true;
    }

    public validate(): Promise<ValidationResult[]> {
        for (const extendedManager of this.extendedFormManager) {
            const result = extendedManager.validate();
            if (result) {
                return result;
            }
        }
        return null;
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

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        for (const manager of this.extendedFormManager) {
            const extendedOperations = await manager.getInputType(property);
            if (extendedOperations) {
                return extendedOperations;
            }
        }

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            return await this.getInputTypeForDF(property);
        }

        return InputFieldTypes.TEXT;
    }

    public async isMultiselect(property: string): Promise<boolean> {
        for (const extendedManager of this.extendedFormManager) {
            const result = extendedManager.isMultiselect(property);
            if (result) {
                return result;
            }
        }

        let isMultiSelect = false;
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (
                field && field.FieldType === DynamicFieldTypes.SELECTION &&
                field.Config && Number(field.Config.CountMax) > 1
            ) {
                isMultiSelect = true;
            }
        }
        return isMultiSelect;
    }

    protected async getInputTypeForDF(property: string): Promise<InputFieldTypes> {
        let inputFieldType = InputFieldTypes.TEXT;
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (field) {
                if (field.FieldType === DynamicFieldTypes.TEXT_AREA) {
                    inputFieldType = InputFieldTypes.TEXT_AREA;
                } else if (field.FieldType === DynamicFieldTypes.DATE) {
                    inputFieldType = InputFieldTypes.DATE;
                } else if (field.FieldType === DynamicFieldTypes.DATE_TIME) {
                    inputFieldType = InputFieldTypes.DATE_TIME;
                } else if (field.FieldType === DynamicFieldTypes.SELECTION) {
                    inputFieldType = InputFieldTypes.DROPDOWN;
                } else if (field.FieldType === DynamicFieldTypes.CI_REFERENCE) {
                    inputFieldType = InputFieldTypes.OBJECT_REFERENCE;
                }
            }
        }
        return inputFieldType;
    }

    protected async checkReadPermissions(resource: string): Promise<boolean> {
        if (!this.readPermissions.has(resource)) {
            const permission = await AuthenticationSocketClient.getInstance().checkPermissions(
                [new UIComponentPermission(resource, [CRUD.READ])]
            );
            this.readPermissions.set(resource, permission);
        }

        return this.readPermissions.get(resource);
    }

}
