import { KIXObjectType, InputFieldTypes, TreeNode } from "../../model";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { DynamicFormAutocompleteDefinition } from "./DynamicFormAutocompleteDefinition";

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

    getSpecificInput(): string;

    getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>>;

    getTreeNodes(property: string): Promise<TreeNode[]>;

    getProperties(): Promise<Array<[string, string]>>;

    getPropertiesPlaceholder(): Promise<string>;

    propertiesAreUnique(): Promise<boolean>;

    hasValueForProperty(property: string): boolean;

    getOperations(property: string): Promise<string[]>;

    getOperationsPlaceholder(): Promise<string>;

    opertationIsAutocompete(property: string): Promise<boolean>;

    operationIsStringInput(property: string): Promise<boolean>;

    getAutoCompleteData(): Promise<DynamicFormAutocompleteDefinition>;

    getOperatorDisplayText(o: string): string;

    searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]>;
}
