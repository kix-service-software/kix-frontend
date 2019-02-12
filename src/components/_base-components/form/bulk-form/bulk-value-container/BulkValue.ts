import {
    IdService, LabelService, KIXObjectService, ObjectPropertyValue, PropertyOperator
} from "../../../../../core/browser";
import { TreeNode, InputFieldTypes, DateTimeUtil, TreeUtil } from "../../../../../core/model";
import { BulkManager } from "../../../../../core/browser/bulk";
import { PropertyOperatorUtil } from "../../../../../core/browser/PropertyOperatorUtil";

export class BulkValue {

    public isDropdown: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;
    public isAutocomplete: boolean = false;

    public nodes: TreeNode[] = [];
    public currentValueNodes: TreeNode[] = [];

    private currentValue: any;
    private date: string;
    private time: string = '';

    public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    public constructor(
        public bulkManager: BulkManager,
        public bulkValue = new ObjectPropertyValue(null, null, null),
        public id: string = IdService.generateDateBasedId('bulkValue'),
        public removable: boolean = true,
        public operationNodes: TreeNode[] = [],
        public propertyNodes: TreeNode[] = [],
        public currentPropertyNode: TreeNode = null,
        public currentOperationNode: TreeNode = null,
        public readonly: boolean = bulkValue.readonly,
        public changeable: boolean = bulkValue.changeable
    ) {
        this.autoCompleteCallback = this.doAutocompleteSearch.bind(this);
    }

    public async init(): Promise<void> {
        await this.createPropertyNodes();
        if (this.bulkValue.property) {
            let propertyNode = this.propertyNodes.find((pn) => pn.id === this.bulkValue.property);
            if (!propertyNode) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.bulkManager.objectType);
                const label = await labelProvider.getPropertyText(this.bulkValue.property);
                propertyNode = new TreeNode(this.bulkValue.property, label);
            }
            await this.setPropertyNode(propertyNode, true);
        }

        await this.createOperationNodes();
        if (this.operationNodes && this.operationNodes.length) {
            let operatorNode = this.operationNodes[0];
            if (this.bulkValue.operator) {
                operatorNode = this.operationNodes.find((on) => on.id === this.bulkValue.operator);
            }
            this.setOperationNode(operatorNode);
        }

        await this.setCurrentValue(this.bulkValue.value);
        this.readonly = this.bulkValue.readonly;
    }

    public async setPropertyNode(propertyNode: TreeNode, update: boolean = false): Promise<void> {
        this.currentPropertyNode = propertyNode;
        this.nodes = [];
        this.operationNodes = [];
        this.currentOperationNode = null;

        if (!update) {
            this.bulkValue.objectType = null;
            this.currentValueNodes = [];
        }

        if (this.currentPropertyNode) {
            const inputType = await this.bulkManager.getInputType(this.currentPropertyNode.id);

            this.isDate = inputType === InputFieldTypes.DATE;
            this.isDateTime = inputType === InputFieldTypes.DATE_TIME;

            this.isDropdown = inputType === InputFieldTypes.DROPDOWN
                || inputType === InputFieldTypes.CI_REFERENCE
                || inputType === InputFieldTypes.OBJECT_REFERENCE;

            this.isAutocomplete = inputType === InputFieldTypes.OBJECT_REFERENCE
                || inputType === InputFieldTypes.CI_REFERENCE;

            await this.createOperationNodes();
            if (this.operationNodes && this.operationNodes.length) {
                this.setOperationNode(this.operationNodes[0]);
            }

            if (this.isDropdown && !this.isAutocomplete) {
                this.nodes = await this.bulkManager.getTreeNodes(this.currentPropertyNode.id);
            }
        }

        this.createPropertyNodes();
    }

    public setOperationNode(operationNode?: TreeNode, operator?: PropertyOperator): void {
        if (operationNode) {
            this.currentOperationNode = operationNode;
        } else if (operator) {
            this.currentOperationNode = this.operationNodes.find((on) => on.id === operator);
        }
    }

    public async setCurrentValue(value: any): Promise<void> {
        this.currentValue = value;
        if (this.bulkValue.objectType && value) {
            const objects = await KIXObjectService.loadObjects(this.bulkValue.objectType, [value]);
            let label = value;
            if (objects && objects.length) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.bulkValue.objectType);
                label = await labelProvider.getObjectText(objects[0]);
            }
            this.currentValueNodes = [new TreeNode(value, label)];
        } else if (this.isDropdown && this.nodes && this.nodes.length) {
            const node = TreeUtil.findNode(this.nodes, value);
            this.currentValueNodes = [node];
        }
    }

    public setTreeValues(nodes: TreeNode[]): void {
        this.currentValueNodes = nodes;
        this.currentValue = nodes && nodes.length ? nodes[0].id : null;
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

    public getBulkValue(): ObjectPropertyValue {
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

        this.bulkValue.property = property;
        this.bulkValue.operator = operator;
        this.bulkValue.value = value;
        return this.bulkValue;
    }

    private async createPropertyNodes(): Promise<void> {
        const properties = await this.bulkManager.getProperties();
        if (properties) {
            const nodes = [];
            for (const p of properties) {
                if (!this.bulkManager.hasValueForProperty(p[0])) {
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
        }

        const operations = await this.bulkManager.getOperations(property);
        this.operationNodes = operations.map((o) => new TreeNode(o, PropertyOperatorUtil.getText(o)));
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        return this.bulkManager.searchValues(this.currentPropertyNode.id, searchValue, limit);
    }

}
