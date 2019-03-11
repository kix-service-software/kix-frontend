import {
    IdService, KIXObjectSearchService, SearchOperator, SearchOperatorUtil, SearchProperty, SearchDefinition
} from '../../../../../core/browser';
import {
    TreeNode, FilterCriteria, FilterDataType,
    FilterType, KIXObjectType, InputFieldTypes, DateTimeUtil
} from '../../../../../core/model';
import { isArray } from 'util';

export class FormSearchValue {

    public isDropdown: boolean = false;
    public isMultiselect: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;
    public isAutocomplete: boolean = false;

    public nodes: TreeNode[] = [];
    public currentValueNodes: TreeNode[] = [];

    private currentValue: any;
    private date: string;
    private time: string = '';

    private searchParameter: Array<[string, any]>;

    public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    public constructor(
        public objectType: KIXObjectType,
        public searchDefinition: SearchDefinition,
        public id: string = IdService.generateDateBasedId('searchValue'),
        public removable: boolean = true,
        public operationNodes: TreeNode[] = [],
        public currentPropertyNode: TreeNode = null,
        public currentOperationNode: TreeNode = null
    ) {
        this.autoCompleteCallback = this.doAutocompleteSearch.bind(this);
    }

    public async setPropertyNode(propertyNode: TreeNode, parameter: Array<[string, any]>): Promise<void> {
        this.currentPropertyNode = propertyNode;
        this.nodes = [];
        this.currentValueNodes = [];
        this.operationNodes = [];
        this.currentOperationNode = null;
        this.currentValue = null;

        if (this.currentPropertyNode) {
            let operations = [];

            if (this.currentPropertyNode.id === SearchProperty.FULLTEXT) {
                operations = [SearchOperator.CONTAINS];
            } else {
                operations = await KIXObjectSearchService.getInstance().getSearchOperations(
                    this.objectType, propertyNode.id, parameter
                );
            }

            this.operationNodes = [];
            for (const o of operations) {
                const label = await SearchOperatorUtil.getText(o);
                this.operationNodes.push(new TreeNode(o, label));
            }
            if (this.operationNodes && this.operationNodes.length) {
                this.setOperationNode(this.operationNodes[0]);
            }

            const inputType = await KIXObjectSearchService.getInstance().getSearchInputType(
                this.objectType, this.currentPropertyNode.id, parameter
            );

            this.isDate = inputType === InputFieldTypes.DATE;
            this.isDateTime = inputType === InputFieldTypes.DATE_TIME;

            this.isDropdown = inputType === InputFieldTypes.DROPDOWN
                || inputType === InputFieldTypes.CI_REFERENCE
                || inputType === InputFieldTypes.OBJECT_REFERENCE;

            this.isAutocomplete = inputType === InputFieldTypes.OBJECT_REFERENCE
                || inputType === InputFieldTypes.CI_REFERENCE;

            if (this.isDropdown) {
                this.nodes = await KIXObjectSearchService.getInstance().getTreeNodes(
                    this.objectType, this.currentPropertyNode.id, parameter
                );
            }
        }
    }

    public setSearchParameter(parameter: Array<[string, any]>): void {
        this.searchParameter = parameter;
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

    public doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        return this.searchDefinition.searchValues(
            this.currentPropertyNode.id, this.searchParameter, searchValue, limit
        );
    }

}
