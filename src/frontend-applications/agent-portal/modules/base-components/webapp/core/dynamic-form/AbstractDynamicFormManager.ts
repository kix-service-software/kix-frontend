/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDynamicFormManager } from './IDynamicFormManager';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { InputFieldTypes } from '../InputFieldTypes';
import { TreeNode } from '../tree';
import { DynamicFormOperationsType } from './DynamicFormOperationsType';
import { AuthenticationSocketClient } from '../AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ValidationResult } from '../ValidationResult';
import { DynamicFieldTypes } from '../../../../dynamic-fields/model/DynamicFieldTypes';
import { KIXObjectService } from '../KIXObjectService';
import { ExtendedDynamicFormManager } from './ExtendedDynamicFormManager';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../../../../dynamic-fields/model/DynamicFieldProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { DynamicField } from '../../../../dynamic-fields/model/DynamicField';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ServiceRegistry } from '../ServiceRegistry';
import { IKIXObjectService } from '../IKIXObjectService';
import { ObjectPropertyValueOption } from '../../../../../model/ObjectPropertyValueOption';
import { ValidationSeverity } from '../ValidationSeverity';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { DynamicFieldFormUtil } from '../DynamicFieldFormUtil';
import { ContextService } from '../ContextService';
import { ContextMode } from '../../../../../model/ContextMode';

export abstract class AbstractDynamicFormManager implements IDynamicFormManager {

    public objectType: KIXObjectType | string = KIXObjectType.ANY;

    protected values: ObjectPropertyValue[] = [];

    protected listeners: Map<string, () => void> = new Map();

    public uniqueProperties: boolean = true;

    protected readPermissions: Map<string, boolean> = new Map();

    public resetOperator: boolean = true;
    public resetValue: boolean = true;

    public useOwnSearch: boolean = false;
    public validDFTypes = [];

    protected propertiesIgnoreList: string[] = [];

    public async getUseOwnSearch(property: string): Promise<boolean> {
        for (const extendedManager of this.extendedFormManager) {
            const extentedUseOwnSearch = await extendedManager.getUseOwnSearch(property);
            if (extentedUseOwnSearch !== null) {
                return extentedUseOwnSearch;
            }
        }
        return this.useOwnSearch;
    }

    public async addToPropertiesIgnoreList(properties: string[]): Promise<void> {
        properties.forEach((p) => {
            if (!this.propertiesIgnoreList.some((ip) => ip === p)) {
                this.propertiesIgnoreList.push(p);
            }
        });
    }

    public async removeFromPropertiesIgnoreList(properties: string[]): Promise<void> {
        this.propertiesIgnoreList = this.propertiesIgnoreList.filter((ip) => !properties.some((p) => p === ip));
    }

    public filterProperties(properties: string[]): string[] {
        return properties.filter((p) => !this.propertiesIgnoreList.some((ip) => ip === p));
    }

    public async getFieldOptions(): Promise<ObjectPropertyValueOption[]> {
        return [];
    }

    public async getProperties(validDynamicFields: boolean = true): Promise<Array<[string, string]>> {
        let properties = [];

        for (const manager of this.extendedFormManager) {
            const extendedProperties = await manager.getProperties();
            if (extendedProperties) {
                properties = [...properties, ...extendedProperties];
            }
        }

        if (await this.checkReadPermissions('/system/dynamicfields')) {
            let validTypes = this.validDFTypes;
            this.extendedFormManager.forEach((m) => validTypes = [...validTypes, ...m.getValidDFTypes()]);

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
                            DynamicFieldTypes.TEXT,
                            DynamicFieldTypes.TEXT_AREA,
                            DynamicFieldTypes.DATE,
                            DynamicFieldTypes.DATE_TIME,
                            DynamicFieldTypes.SELECTION,
                            DynamicFieldTypes.CI_REFERENCE,
                            DynamicFieldTypes.TICKET_REFERENCE,
                            // Implementation of this type is postponed // DynamicFieldTypes.TABLE,
                            ...validTypes
                        ]
                    )
                ]
            );

            if (validDynamicFields) {
                loadingOptions.filter.push(
                    new FilterCriteria(
                        KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                        FilterDataType.NUMERIC, FilterType.AND, 1
                    )
                );
            }

            const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
            ).catch(() => [] as DynamicField[]);

            if (dynamicFields && dynamicFields.length) {
                for (const df of dynamicFields) {
                    if (
                        df.FieldType === DynamicFieldTypes.CI_REFERENCE
                        && !await this.checkReadPermissions('/cmdb/configitems')
                    ) { continue; }
                    if (
                        df.FieldType === DynamicFieldTypes.TICKET_REFERENCE
                        && !await this.checkReadPermissions('/tickets')
                    ) { continue; }
                    let label = await TranslationService.translate(df.Label);
                    const context = ContextService.getInstance().getActiveContext();
                    if (context?.descriptor.contextMode === ContextMode.CREATE_ADMIN ||
                        context?.descriptor.contextMode === ContextMode.EDIT_ADMIN) {
                        label = `${df.Name} (${label})`;
                    }
                    properties.push([`${KIXObjectProperty.DYNAMIC_FIELDS}.${df.Name}`, label]);
                }
            }
        }

        return properties.filter((p, index) => properties.indexOf(p) === index);
    }

    protected extendedFormManager: ExtendedDynamicFormManager[] = [];

    public addExtendedFormManager(manager: ExtendedDynamicFormManager): void {
        this.extendedFormManager.push(manager);
    }

    public getExtendedFormManager(): ExtendedDynamicFormManager[] {
        return this.extendedFormManager;
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

    public async searchObjectTree(
        property: string, searchValue: string, loadingOptions: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        for (const extendedManager of this.extendedFormManager) {
            const extentedNode = await extendedManager.searchObjectTree(property, searchValue, loadingOptions);
            if (extentedNode) {
                return extentedNode;
            }
        }
        return [];
    }

    public async hasDefinedValues(): Promise<boolean> {
        const editableValues = await this.getEditableValues();
        return !!editableValues.length;
    }

    public async setValue(newValue: ObjectPropertyValue, silent?: boolean): Promise<void> {
        const index = this.values.findIndex((bv) => bv.id === newValue.id);
        if (index !== -1) {
            this.values[index].property = newValue.property;
            this.values[index].operator = newValue.operator;
            this.values[index].value = newValue.value;
            this.values[index].required = newValue.required;
            this.values[index].additionalOptions = newValue.additionalOptions;
        } else {
            this.values.push(newValue);
        }

        await this.checkProperties();
        await this.validate();
        if (!silent) {
            this.notifyListeners();
        }
    }

    public async removeValue(importValue: ObjectPropertyValue): Promise<void> {
        const index = this.values.findIndex((bv) => bv.id === importValue.id);
        if (index !== -1) {
            this.values.splice(index, 1);
        }

        await this.checkProperties();
        // TODO: do something with validate results
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

    public getSpecificInput(property: string): string {
        for (const extendedManager of this.extendedFormManager) {
            const result = extendedManager.getSpecificInput(property);
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

        let options: Array<[string, any]> = [];
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (field?.FieldType === DynamicFieldTypes.CI_REFERENCE) {
                const fieldOptions = DynamicFieldFormUtil.getInstance().getCIReferenceFieldOptions(field);
                options = fieldOptions.map((o) => [o.option, o.value]);
            }
        }

        return options;
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

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getTreeNodes(property, objectIds);
            if (result) {
                return result;
            }
        }
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            return await this.getNodesForDF(dfName);
        }
        return [];
    }

    private async getNodesForDF(name: string): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        const field = await KIXObjectService.loadDynamicField(name);
        if (field) {
            if (
                field.FieldType === DynamicFieldTypes.SELECTION
                && field.Config && field.Config.PossibleValues && field.Config.TranslatableValues
            ) {
                for (const pv in field.Config.PossibleValues) {
                    if (field.Config.PossibleValues[pv]) {
                        const value = field.Config.PossibleValues[pv]
                            ? await TranslationService.translate(field.Config.PossibleValues[pv]) : pv;
                        const node = new TreeNode(pv, value);
                        nodes.push(node);
                    }
                }
            }
        }
        return nodes;
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

    public async getEditableValues(): Promise<ObjectPropertyValue[]> {
        return [...this.values];
    }

    public async clearValueOnPropertyChange(property: string): Promise<boolean> {
        return true;
    }

    public async validate(): Promise<ValidationResult[]> {
        const fullResult = [];
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.validate();
            if (result) {
                fullResult.push(...result);
            }
        }
        for (const value of this.values) {
            if (value.operator === SearchOperator.BETWEEN && Array.isArray(value.value)) {
                const fieldType = await this.getInputType(value.property);
                if (fieldType && fieldType === InputFieldTypes.DATE || fieldType === InputFieldTypes.DATE_TIME) {
                    const result = this.checkDate(value);
                    if (result) {
                        fullResult.push(...result);
                    }
                } else if (fieldType && fieldType === InputFieldTypes.NUMBER) {
                    const result = this.checkNumber(value);
                    if (result) {
                        fullResult.push(...result);
                    }
                }
            }
            if (value.operator === SearchOperator.WITHIN && Array.isArray(value.value)) {
                value.valid = true;
                const missingMapping = [
                    'Translatable#Type of first value is missing.',
                    'Translatable#First number value is missing.',
                    'Translatable#Unit of first value is missing.',
                    'Translatable#Type of second value is missing.',
                    'Translatable#Second number value is missing.',
                    'Translatable#Unit of second value is missing.',
                ];
                for (let i = 0; i < 6; i++) {
                    if (!value.value[i]) {
                        fullResult.push(new ValidationResult(
                            ValidationSeverity.ERROR, missingMapping[i]
                        ));
                    }
                }
                if (value.value[1] && !value.value[1].match(/^\d+$/)) {
                    fullResult.push(new ValidationResult(
                        ValidationSeverity.ERROR, 'Translatable#First number value is not an integer.'
                    ));
                }
                if (value.value[4] && !value.value[4].match(/^\d+$/)) {
                    fullResult.push(new ValidationResult(
                        ValidationSeverity.ERROR, 'Translatable#Second number value is not an integer.'
                    ));
                }
            }
        }
        return fullResult;
    }

    private checkDate(value: ObjectPropertyValue): ValidationResult[] {
        const start: Date = new Date(value.value[0]);
        const end: Date = new Date(value.value[1]);
        if (typeof start.getTime !== 'function') {
            value.valid = false;
            return [new ValidationResult(
                ValidationSeverity.ERROR, 'Translatable#Start date/time is not given'
            )];
        } else if (typeof end.getTime !== 'function') {
            value.valid = false;
            return [new ValidationResult(
                ValidationSeverity.ERROR, 'Translatable#End date/time is not given'
            )];
        } else if (start.getTime() > end.getTime()) {
            value.valid = false;
            return [new ValidationResult(
                ValidationSeverity.ERROR, 'Translatable#Start time has to be before end time'
            )];
        } else {
            value.valid = true;
        }
        return null;
    }
    private checkNumber(value: ObjectPropertyValue): ValidationResult[] {
        if (isNaN(Number(value.value[0])) || value.value[0] === null) {
            value.valid = false;
            return [new ValidationResult(
                ValidationSeverity.ERROR, 'Translatable#Start value is not given'
            )];
        } else if (isNaN(Number(value.value[1])) || value.value[1] === null) {
            value.valid = false;
            return [new ValidationResult(
                ValidationSeverity.ERROR, 'Translatable#End value is not given'
            )];
        } else if (Number(value.value[0]) > Number(value.value[1])) {
            value.valid = false;
            return [new ValidationResult(
                ValidationSeverity.ERROR, 'Translatable#Start value is greater than end value'
            )];
        } else {
            value.valid = true;
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

    public async getInputType(property: string, operator?: SearchOperator): Promise<InputFieldTypes | string> {
        for (const manager of this.extendedFormManager) {
            const extendedOperations = await manager.getInputType(property, operator);
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

    public async isMultiselect(
        property: string, operator: SearchOperator | string, forSearch?: boolean
    ): Promise<boolean> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.isMultiselect(property, operator);
            if (result !== undefined && result !== null) {
                return result;
            }
        }

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (
                field &&
                (
                    field.FieldType === DynamicFieldTypes.SELECTION ||
                    field.FieldType === DynamicFieldTypes.TICKET_REFERENCE ||
                    field.FieldType === DynamicFieldTypes.CI_REFERENCE
                )
            ) {
                // return true OR false (not only one of them)
                return field.Config && (forSearch || Number(field.Config.CountMax) > 1);
            }
        }

        if (operator === SearchOperator.EQUALS) {
            return false;
        }

        return;
    }

    protected async getInputTypeForDF(property: string): Promise<InputFieldTypes> {
        let inputFieldType = InputFieldTypes.TEXT;
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (field) {
                switch (field.FieldType) {
                    case DynamicFieldTypes.TEXT_AREA:
                        inputFieldType = InputFieldTypes.TEXT_AREA;
                        break;
                    case DynamicFieldTypes.DATE:
                        inputFieldType = InputFieldTypes.DATE;
                        break;
                    case DynamicFieldTypes.DATE_TIME:
                        inputFieldType = InputFieldTypes.DATE_TIME;
                        break;
                    case DynamicFieldTypes.SELECTION:
                        inputFieldType = InputFieldTypes.DROPDOWN;
                        break;
                    case DynamicFieldTypes.CI_REFERENCE:
                    case DynamicFieldTypes.TICKET_REFERENCE:
                        inputFieldType = InputFieldTypes.OBJECT_REFERENCE;
                        break;
                    case DynamicFieldTypes.TABLE:
                        inputFieldType = InputFieldTypes.TABLE;
                        break;
                    default: inputFieldType = InputFieldTypes.TEXT;
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

    public async getObjectTypeForProperty(property: string): Promise<KIXObjectType | string> {
        let objectType = this.objectType;
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(this.objectType);
        if (service) {
            objectType = await service.getObjectTypeForProperty(property);
        }
        return objectType;
    }

    public hasOption(option: ObjectPropertyValueOption, property: string, operator: string): boolean {
        return false;
    }

    public async getAdditionalOptions(property: string): Promise<FormFieldOption[]> {
        let options: FormFieldOption[] = [];

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            options.push({ option: 'FIELD_NAME', value: dfName });
        }

        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getAdditionalOptions(property);
            if (result) {
                options = [...options, ...result];
            }
        }

        return options;
    }

    public hasAdditionalOptions(): boolean {
        return false;
    }

    public validateAdditionalOptions(option: string): string {
        return;
    }

    public valuesAreDraggable(): boolean {
        return false;
    }

    public async changeValueOrder(currentIndex: number, targetIndex: number): Promise<void> {
        if (this.values?.length && !isNaN(currentIndex) && !isNaN(targetIndex) && currentIndex !== targetIndex) {
            const newIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
            const value = this.values.splice(currentIndex, 1);
            this.values.splice(newIndex, 0, value[0]);

            this.notifyListeners();
        }
    }

}
