import {
    IdService, KIXObjectSearchService, SearchOperator, SearchOperatorUtil
} from "@kix/core/dist/browser";
import {
    TreeNode, FilterCriteria, FilterDataType,
    FilterType, KIXObjectType, InputFieldTypes, DateTimeUtil
} from "@kix/core/dist/model";
import { isArray } from "util";

export class FormSearchValue {

    public isDropdown: boolean = false;
    public isMultiselect: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;

    public nodes: TreeNode[] = [];
    public currentValueNodes: TreeNode[] = [];

    private currentValue: any;
    private date: string;
    private time: string = '';

    public constructor(
        public objectType: KIXObjectType = null,
        public id: string = IdService.generateDateBasedId('searchValue'),
        public removable: boolean = true,
        public operationNodes: TreeNode[] = [],
        public currentPropertyNode: TreeNode = null,
        public currentOperationNode: TreeNode = null
    ) { }

    public setPropertyNode(propertyNode: TreeNode): void {
        this.currentPropertyNode = propertyNode;
        this.nodes = [];
        this.currentValueNodes = [];
        this.operationNodes = [];
        this.currentOperationNode = null;
        this.currentValue = null;

        if (this.currentPropertyNode) {
            const operations = KIXObjectSearchService.getInstance().getSearchOperations(
                this.objectType, propertyNode.id
            );
            this.operationNodes = operations.map((o) => new TreeNode(o, SearchOperatorUtil.getText(o)));
            if (this.operationNodes && this.operationNodes.length) {
                this.setOperationNode(this.operationNodes[0]);
            }

            const inputType = KIXObjectSearchService.getInstance().getSearchInputType(
                this.objectType, this.currentPropertyNode.id
            );

            this.isDropdown = inputType === InputFieldTypes.DROPDOWN;
            this.isDate = inputType === InputFieldTypes.DATE;
            this.isDateTime = inputType === InputFieldTypes.DATE_TIME;

            if (this.isDropdown) {
                this.nodes = KIXObjectSearchService.getInstance().getTreeNodes(
                    this.objectType, this.currentPropertyNode.id
                );
            }
        }
    }

    public setOperationNode(operationNode?: TreeNode, operator?: SearchOperator): void {
        if (operationNode) {
            this.currentOperationNode = operationNode;
        } else if (operator) {
            this.currentOperationNode = this.operationNodes.find((on) => on.id === operator);
        }

        this.isMultiselect = this.currentOperationNode
            ? this.currentOperationNode.id === SearchOperator.IN
            : false;
    }

    public setCurrentValue(value: any): void {
        this.currentValue = value;
        this.currentValueNodes = [];
        if (this.isDropdown) {
            if (isArray(value)) {
                value.forEach((v) => this.currentValueNodes.push(this.nodes.find((n) => n.id === v)));
            } else {
                this.currentValueNodes = [this.nodes.find((n) => n.id === value)];
            }
        }
    }

    public setTreeValues(nodes: TreeNode[]): void {
        this.currentValueNodes = nodes;
        if (this.isMultiselect) {
            this.currentValue = nodes.map((n) => n.id);
        } else {
            this.currentValue = nodes && nodes.length ? nodes[0].id : null;
        }
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

    public getFilterCriteria(): FilterCriteria {
        const property = this.currentPropertyNode
            ? this.currentPropertyNode.id
            : null;

        const operator = this.currentOperationNode
            ? this.currentOperationNode.id
            : null;

        let value = this.currentValue;

        let filterDataType = FilterDataType.STRING;
        if (this.isDate) {
            filterDataType = FilterDataType.DATE;
            const date = new Date(this.date);
            value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
        } else if (this.isDateTime) {
            filterDataType = FilterDataType.DATETIME;
            const date = new Date(`${this.date} ${this.time}`);
            value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
        }

        return new FilterCriteria(property, operator, filterDataType, FilterType.AND, value);
    }

}
