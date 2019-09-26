/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, InputFieldTypes, TreeNode } from "../../../model";
import { ObjectPropertyValue } from "../../ObjectPropertyValue";
import { DynamicFormOperationsType } from "./DynamicFormOperationsType";

export interface IDynamicFormManager {

    objectType: KIXObjectType;

    registerListener(listenerId: string, callback: () => void): void;

    unregisterListener(listenerId: string): void;

    init(): void;

    reset(): void;

    getValues(): ObjectPropertyValue[];

    setValue(importValue: ObjectPropertyValue): Promise<void>;

    removeValue(importValue: ObjectPropertyValue): Promise<void>;

    showValueInput(value: ObjectPropertyValue): boolean;

    getInputType(property: string): Promise<InputFieldTypes | string>;

    getObjectReferenceObjectType(property: string): Promise<KIXObjectType>;

    getSpecificInput(): string;

    getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>>;

    getTreeNodes(property: string): Promise<TreeNode[]>;

    getProperties(): Promise<Array<[string, string]>>;

    getPropertiesPlaceholder(): Promise<string>;

    propertiesAreUnique(): Promise<boolean>;

    hasValueForProperty(property: string): boolean;

    getOperations(property: string): Promise<string[]>;

    getOperationsPlaceholder(): Promise<string>;

    getOpertationsType(property: string): Promise<DynamicFormOperationsType>;

    getOperatorDisplayText(o: string): string;

    clearValueOnPropertyChange(property: string): Promise<boolean>;

    isMultiselect(property: string): boolean;

    searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]>;

    validate(): Promise<void>;
}
