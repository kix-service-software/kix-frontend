/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFormOperationsType } from './DynamicFormOperationsType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { InputFieldTypes } from '../InputFieldTypes';
import { TreeNode } from '../tree';
import { ValidationResult } from '../ValidationResult';
import { ObjectPropertyValueOption } from '../../../../../model/ObjectPropertyValueOption';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';

export interface IDynamicFormManager {

    objectType: KIXObjectType | string;

    uniqueProperties: boolean;

    resetOperator?: boolean;

    resetValue?: boolean;

    useOwnSearch?: boolean;

    getFieldOptions(): Promise<any[]>;

    getUseOwnSearch(property: string): Promise<boolean>;

    searchObjectTree(
        property: string, searchValue: string, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]>;

    registerListener(listenerId: string, callback: () => void): void;

    unregisterListener(listenerId: string): void;

    init(): void;

    reset(notify?: boolean): void;

    getValues(): ObjectPropertyValue[];

    setValue(importValue: ObjectPropertyValue, silent?: boolean): Promise<void>;

    removeValue(importValue: ObjectPropertyValue): Promise<void>;

    showValueInput(value: ObjectPropertyValue): boolean;

    getInputType(property: string, operator?: SearchOperator): Promise<InputFieldTypes | string>;

    getObjectReferenceObjectType(property: string): Promise<KIXObjectType | string>;

    getSpecificInput(property: string): Promise<string>;

    getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>>;

    getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]>;

    getProperties(): Promise<Array<[string, string]>>;

    getPropertiesPlaceholder(): Promise<string>;

    isHiddenProperty(property: string): Promise<boolean>;

    hasValueForProperty(property: string): boolean;

    getOperations(property: string): Promise<string[]>;

    getOperationsPlaceholder(): Promise<string>;

    getOpertationsType(property: string): Promise<DynamicFormOperationsType>;

    getOperatorDisplayText(o: string): Promise<string>;

    clearValueOnPropertyChange(property: string): Promise<boolean>;

    isMultiselect(property: string, operator: SearchOperator | string): Promise<boolean>;

    validate(): Promise<ValidationResult[]>;

    shouldAddEmptyField(): Promise<boolean>;

    hasOption(option: ObjectPropertyValueOption, property: string, operator: string): boolean;

    hasAdditionalOptions(): boolean;

    getAdditionalOptions(property: string): Promise<FormFieldOption[]>;

    validateAdditionalOptions(options: string): string;

    changeValueOrder(currentIndex: number, targetIndex: number): Promise<void>;

    valuesAreDraggable(): boolean;

    prepareLoadingOptions(
        value: ObjectPropertyValue, loadingOptions: KIXObjectLoadingOptions
    ): Promise<KIXObjectLoadingOptions>;

    isRelativDateTimeOperator(operator: string): boolean;
}
