/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IdService, SearchOperator, SearchOperatorUtil, SearchProperty, SearchDefinition
} from '../../../../../core/browser';
import {
    TreeNode, FilterCriteria, FilterDataType,
    FilterType, KIXObjectType, InputFieldTypes, DateTimeUtil
} from '../../../../../core/model';
import { SearchService } from '../../../../../core/browser/kix/search/SearchService';

export class FormSearchValue {

    public isDropdown: boolean = false;
    public isMultiselect: boolean = false;
    public isDate: boolean = false;
    public isDateTime: boolean = false;
    public isBetweenDate: boolean = false;
    public isAutocomplete: boolean = false;

    public nodes: TreeNode[] = [];
    public currentValueNodes: TreeNode[] = [];

    private currentValue: any;
    private date: string;
    private time: string = '';
    private betweenEndDate: string;
    private betweenEndTime: string = '';

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
                operations = await SearchService.getInstance().getSearchOperations(
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

            const inputType = await SearchService.getInstance().getSearchInputType(
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
                this.nodes = await SearchService.getInstance().getTreeNodes(
                    this.objectType, this.currentPropertyNode.id, parameter
                ).catch(() => []);
            }

            if (this.isDate && !this.date) {
                const now = new Date(Date.now());
                this.setDateValue(DateTimeUtil.getKIXDateString(now));
            } else if (this.isDateTime) {
                const now = new Date(Date.now());
                if (!this.time) {
                    this.setTimeValue(DateTimeUtil.getKIXTimeString(now));
                }
                if (!this.date) {
                    this.setDateValue(DateTimeUtil.getKIXDateString(now));
                }
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

        this.isBetweenDate = this.currentOperationNode
            ? this.currentOperationNode.id === SearchOperator.BETWEEN
            : false;
        if (this.isBetweenDate && this.date) {
            this.setDateValue(this.date);
        }
    }

    public async setCurrentValue(value: any, parameter: Array<[string, any]>): Promise<void> {
        this.currentValue = value;
        this.currentValueNodes = [];
        if (this.isDropdown) {
            if (this.isAutocomplete && value) {
                this.nodes = await this.searchDefinition.getValueNodesForAutocomplete(
                    this.currentPropertyNode.id,
                    Array.isArray(value) ? value : [value],
                    parameter
                );
            }
            if (Array.isArray(value)) {
                const valueNodes = [];
                value.forEach((v) => {
                    const node = this.getSelectedNode(v);
                    if (node) {
                        valueNodes.push(node);
                    }
                });
                this.currentValueNodes = valueNodes;
            } else {
                this.currentValueNodes = [this.nodes.find((n) => n.id === value)];
            }
        } else if (this.isDate) {
            if (this.isBetweenDate) {
                const date = new Date(value[0]);
                if (!isNaN(date.getTime())) {
                    this.date = DateTimeUtil.getKIXDateString(date);
                }
                const endDate = new Date(value[1]);
                if (!isNaN(endDate.getTime())) {
                    this.betweenEndDate = DateTimeUtil.getKIXDateString(endDate);
                }
            } else {
                const date = new Date(value[0]);
                if (!isNaN(date.getTime())) {
                    this.date = DateTimeUtil.getKIXDateString(date);
                }
            }
        } else if (this.isDateTime) {
            if (this.isBetweenDate) {
                const date = new Date(value[0]);
                if (!isNaN(date.getTime())) {
                    this.date = DateTimeUtil.getKIXDateString(date);
                    this.time = DateTimeUtil.getKIXTimeString(date);
                }
                const endDate = new Date(value[1]);
                if (!isNaN(endDate.getTime())) {
                    this.betweenEndDate = DateTimeUtil.getKIXDateString(endDate);
                    this.betweenEndTime = DateTimeUtil.getKIXTimeString(endDate);
                }
            } else {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    this.date = DateTimeUtil.getKIXDateString(date);
                    this.time = DateTimeUtil.getKIXTimeString(date);
                }
            }
        }
    }

    private getSelectedNode(value: any, nodes: TreeNode[] = this.nodes): TreeNode {
        let valueNode = null;
        for (const n of nodes) {
            valueNode = n.id === value
                ? n
                : n.children ? this.getSelectedNode(value, n.children) : null;
            if (valueNode) {
                break;
            }
        }
        return valueNode;
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
        if (this.isDateTime) {
            if (!this.time) {
                this.time = '00:00:00';
            }
            if (this.isBetweenDate) {
                if (!this.betweenEndDate) {
                    this.betweenEndDate = this.date;
                }
                if (!this.betweenEndTime) {
                    this.betweenEndTime = this.time;
                }
            }
        } else if (this.isBetweenDate && !this.betweenEndDate) {
            this.betweenEndDate = this.date;
        }
    }

    public setTimeValue(value: string): void {
        this.time = value;
        if (this.isBetweenDate && !this.betweenEndTime) {
            this.betweenEndTime = this.time;
        }
    }

    public setBetweenEndDateValue(value: string): void {
        this.betweenEndDate = value;
    }

    public setBetweenEndTimeValue(value: string): void {
        this.betweenEndTime = value;
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
            if (this.isBetweenDate && value) {
                const endDate = new Date(this.betweenEndDate);
                value = isNaN(endDate.getTime()) ? null : [value, DateTimeUtil.getKIXDateTimeString(endDate)];
            }
        } else if (this.isDateTime) {
            filterDataType = FilterDataType.DATETIME;
            const date = new Date(`${this.date} ${this.time}`);
            value = isNaN(date.getTime()) ? null : DateTimeUtil.getKIXDateTimeString(date);
            if (this.isBetweenDate && value) {
                const endDate = new Date(`${this.betweenEndDate} ${this.betweenEndTime}`);
                value = isNaN(endDate.getTime()) ? null : [value, DateTimeUtil.getKIXDateTimeString(endDate)];
            }
        }

        return new FilterCriteria(property, operator, filterDataType, FilterType.AND, value);
    }

    public doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        return this.searchDefinition.searchValues(
            this.currentPropertyNode.id, this.searchParameter, searchValue, limit
        );
    }

}
