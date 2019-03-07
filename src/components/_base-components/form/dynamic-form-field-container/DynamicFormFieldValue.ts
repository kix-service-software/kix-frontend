import {
    IdService, LabelService, KIXObjectService, ObjectPropertyValue, PropertyOperator
} from "../../../../core/browser";
import { TreeNode, InputFieldTypes, DateTimeUtil, TreeUtil } from "../../../../core/model";
import { ImportManager, ImportPropertyOperator, ImportPropertyOperatorUtil } from "../../../../core/browser/import";

export class DynamicFieldValue {

    public isDropdown: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;
    public isAutocomplete: boolean = false;
    public isTextarea: boolean = false;
    public inputOptions: Array<[string, string | number]> = [];

    public nodes: TreeNode[] = [];
    public currentValueNodes: TreeNode[] = [];

    private currentValue: any;
    private date: string;
    private time: string = '';

    public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    public constructor(
        public manager: ImportManager,
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
        await this.createPropertyNodes();
        if (this.value.property) {
            let propertyNode = this.propertyNodes.find((pn) => pn.id === this.value.property);
            if (!propertyNode) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.manager.objectType);
                const label = await labelProvider.getPropertyText(this.value.property);
                propertyNode = new TreeNode(this.value.property, label);
            }
            await this.setPropertyNode(propertyNode, true);
            this.inputOptions = await this.manager.getInputTypeOptions(this.currentPropertyNode.id);
        }

        await this.createOperationNodes();
        if (this.operationNodes && this.operationNodes.length) {
            let operatorNode = this.operationNodes[0];
            if (this.value.operator) {
                operatorNode = this.operationNodes.find((on) => on.id === this.value.operator);
            }
            this.setOperationNode(operatorNode);
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

        if (this.currentPropertyNode) {
            const inputType = await this.manager.getInputType(this.currentPropertyNode.id);

            this.isDate = inputType === InputFieldTypes.DATE;
            this.isDateTime = inputType === InputFieldTypes.DATE_TIME;

            this.isDropdown = inputType === InputFieldTypes.DROPDOWN
                || inputType === InputFieldTypes.CI_REFERENCE
                || inputType === InputFieldTypes.OBJECT_REFERENCE;

            this.isAutocomplete = inputType === InputFieldTypes.OBJECT_REFERENCE
                || inputType === InputFieldTypes.CI_REFERENCE;

            this.isTextarea = inputType === InputFieldTypes.TEXT_AREA;

            await this.createOperationNodes();
            if (this.operationNodes && this.operationNodes.length) {
                this.setOperationNode(this.operationNodes[0]);
            }

            if (this.isDropdown && !this.isAutocomplete) {
                this.nodes = await this.manager.getTreeNodes(this.currentPropertyNode.id);
            }
        }

        this.createPropertyNodes();
    }

    // TODO: ggf. generischen Operator verwenden
    public setOperationNode(operationNode?: TreeNode, operator?: PropertyOperator | ImportPropertyOperator): void {
        if (operationNode) {
            this.currentOperationNode = operationNode;
        } else if (operator) {
            this.currentOperationNode = this.operationNodes.find((on) => on.id === operator);
        }
    }

    public async setCurrentValue(value: any): Promise<void> {
        this.currentValue = value;
        if (this.value.objectType && value) {
            const objects = await KIXObjectService.loadObjects(this.value.objectType, [value]);
            let label = value;
            if (objects && objects.length) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.value.objectType);
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

    private async createPropertyNodes(): Promise<void> {
        const properties = await this.manager.getProperties();
        if (properties) {
            const nodes = [];
            for (const p of properties) {
                if (!this.manager.hasValueForProperty(p[0])) {
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

        const operations = await this.manager.getOperations(property);
        // TODO: generisches Util?
        this.operationNodes = operations.map((o) => new TreeNode(o, ImportPropertyOperatorUtil.getText(o)));
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        return this.manager.searchValues(this.currentPropertyNode.id, searchValue, limit);
    }

}
