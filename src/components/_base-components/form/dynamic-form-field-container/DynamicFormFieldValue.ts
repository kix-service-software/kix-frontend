/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IdService, LabelService, KIXObjectService, ObjectPropertyValue, IDynamicFormManager, DynamicFormOperationsType
} from '../../../../core/browser';
import { TreeNode, InputFieldTypes, DateTimeUtil, TreeUtil } from '../../../../core/model';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { KIXModulesService } from '../../../../core/browser/modules';

export class DynamicFieldValue {

    public isDropdown: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;
    public isTextarea: boolean = false;
    public isSpecificInput: boolean = false;
    public specificInputType: string = null;
    public inputOptions: Array<[string, string | number]> = [];

    public operationIsStringInput: boolean = false;
    public operationIsNone: boolean = false;

    public propertiesPlaceholder: string = '';
    public operationsPlaceholder: string = '';

    public nodes: TreeNode[] = [];
    public currentValueNodes: TreeNode[] = [];

    public isMultiselect: boolean = false;
    public isAutocomplete: boolean = false;

    private currentValue: any;
    private date: string;
    private time: string = '';

    public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    public constructor(
        public manager: IDynamicFormManager,
        public value = new ObjectPropertyValue(null, null, null),
        public id: string = IdService.generateDateBasedId('dynamic-value-'),
        public removable: boolean = true,
        public operationNodes: TreeNode[] = [],
        public propertyNodes: TreeNode[] = [],
        public currentPropertyNode: TreeNode = null,
        public currentOperationNode: TreeNode = null,
        public readonly: boolean = value.readonly,
        public changeable: boolean = value.changeable
    ) {
        this.autoCompleteCallback = this.doAutocompleteSearch.bind(this);
    }

    public async init(): Promise<void> {
        await this.createPropertyNodes(false);
        if (this.value.property) {
            let propertyNode = this.propertyNodes.find((pn) => pn.id === this.value.property);
            if (!propertyNode) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.manager.objectType);
                const label = await labelProvider.getPropertyText(this.value.property);
                propertyNode = new TreeNode(this.value.property, label);
            }
            await this.setPropertyNode(propertyNode, true);
        }

        await this.createOperationNodes();
        if (this.operationNodes && this.operationNodes.length) {
            let operatorNode = this.operationNodes[0];
            if (this.value.operator) {
                operatorNode = this.operationNodes.find((on) => on.id === this.value.operator);
            }
            this.setOperationNode(operatorNode);
        } else if ((this.operationIsStringInput) && this.value.operator) {
            this.setOperationNode(null, this.value.operator);
        }

        await this.setCurrentValue(this.value.value);
        this.readonly = this.value.readonly;
    }

    public async setPropertyNode(propertyNode: TreeNode, update: boolean = false): Promise<void> {
        this.currentPropertyNode = propertyNode;
        this.nodes = [];
        this.operationNodes = [];
        this.currentOperationNode = null;

        if (!update) {
            this.value.objectType = null;
            this.currentValueNodes = [];
        }

        await this.createPropertyNodes();
        await this.createOperationNodes();
        if (this.manager.showValueInput(this.value)) {
            const property = this.currentPropertyNode ? this.currentPropertyNode.id : null;
            const inputType = await this.manager.getInputType(property);
            this.inputOptions = await this.manager.getInputTypeOptions(
                property,
                this.currentOperationNode ? this.currentOperationNode.id : null
            );

            this.isDate = inputType === InputFieldTypes.DATE;
            this.isDateTime = inputType === InputFieldTypes.DATE_TIME;

            this.isDropdown = inputType === InputFieldTypes.DROPDOWN || inputType === InputFieldTypes.OBJECT_REFERENCE;

            this.isAutocomplete = inputType === InputFieldTypes.OBJECT_REFERENCE;

            this.isMultiselect = this.manager.isMultiselect(property);

            this.isTextarea = inputType === InputFieldTypes.TEXT_AREA;

            this.isSpecificInput = inputType === 'SPECIFIC';
            if (this.isSpecificInput) {
                const specificInputType = this.manager.getSpecificInput();
                if (specificInputType) {
                    this.specificInputType = KIXModulesService.getComponentTemplate(specificInputType);
                }
            }

            if (this.operationNodes && this.operationNodes.length) {
                this.setOperationNode(this.operationNodes[0]);
            }

            if (this.currentPropertyNode && this.isDropdown) {
                this.nodes = await this.manager.getTreeNodes(this.currentPropertyNode.id);
            }
        }

        const propertiesPlaceholder = await this.manager.getPropertiesPlaceholder();
        if (propertiesPlaceholder) {
            this.propertiesPlaceholder = await TranslationService.translate(propertiesPlaceholder);
        }
        const operationsPlaceholder = await this.manager.getOperationsPlaceholder();
        if (operationsPlaceholder) {
            this.operationsPlaceholder = await TranslationService.translate(operationsPlaceholder);
        }
    }

    public setOperationNode(operationNode?: TreeNode, operator?: string): void {
        if (operationNode) {
            this.currentOperationNode = operationNode;
        } else if (typeof operator !== 'undefined' && operator !== null) {
            let node = this.operationNodes.find((on) => on.id === operator);
            if (!node && this.operationIsStringInput) {
                node = new TreeNode(operator, operator);
            }
            this.currentOperationNode = node;
        }
    }

    public async setCurrentValue(value: any): Promise<void> {
        this.currentValue = value;
        if (this.value.objectType && value) {
            const objects = await KIXObjectService.loadObjects(
                this.value.objectType, Array.isArray(value) ? value : [value]
            );
            let label = value;
            let icon;
            const current: TreeNode[] = [];
            if (objects && objects.length) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.value.objectType);
                for (const object of objects) {
                    label = await labelProvider.getObjectText(objects[0]);
                    icon = labelProvider.getObjectTypeIcon();
                    current.push(new TreeNode(object.ObjectId, label, icon));
                }
            }
            this.currentValueNodes = current;
        } else if (this.isDropdown && this.nodes && this.nodes.length) {
            const current: TreeNode[] = [];
            if (Array.isArray(value)) {
                for (const v of value) {
                    const node = TreeUtil.findNode(this.nodes, v);
                    if (node) {
                        current.push(node);
                    }
                }
            }
            this.currentValueNodes = current;
        }
    }

    public setTreeValues(nodes: TreeNode[]): void {
        this.currentValueNodes = nodes;
        this.currentValue = nodes ? nodes.map((n) => n.id) : null;
    }

    public setTextValue(value: string): void {
        this.currentValue = value;
    }

    public setDateValue(value: string): void {
        this.date = value;
    }

    public setTimeValue(value: string): void {
        this.time = value;
    }

    public setSpecificValue(value: any): void {
        this.currentValue = value;
    }

    public getValue(): ObjectPropertyValue {
        const property = this.currentPropertyNode
            ? this.currentPropertyNode.id
            : null;

        const operator = this.currentOperationNode
            ? this.currentOperationNode.id
            : null;

        let value = this.currentValue;

        if (this.isDate) {
            const date = new Date(this.date);
            value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
        } else if (this.isDateTime) {
            const date = new Date(`${this.date} ${this.time}`);
            value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
        }

        this.value.property = property;
        this.value.operator = operator;
        this.value.value = value;
        return this.value;
    }

    private async createPropertyNodes(check: boolean = true): Promise<void> {
        const properties = await this.manager.getProperties();
        const unique = await this.manager.propertiesAreUnique();
        if (properties) {
            const nodes = [];
            for (const p of properties) {
                if (!check || (!unique || !this.manager.hasValueForProperty(p[0]))) {
                    nodes.push(new TreeNode(p[0], p[1]));
                }
            }
            this.propertyNodes = nodes;
        }
    }

    private async createOperationNodes(): Promise<void> {
        let property: string;

        if (this.currentPropertyNode) {
            property = this.currentPropertyNode.id;
            const operations = await this.manager.getOperations(property);
            this.operationNodes = operations.map((o) => new TreeNode(o, this.manager.getOperatorDisplayText(o)));
        }

        const operationsType = await this.manager.getOpertationsType(property);
        switch (operationsType) {
            case DynamicFormOperationsType.STRING:
                this.operationIsStringInput = true;
                break;
            case DynamicFormOperationsType.NONE:
                this.operationIsNone = true;
                break;
            default:
        }
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        return this.manager.searchValues(this.currentPropertyNode.id, searchValue, limit);
    }

}
