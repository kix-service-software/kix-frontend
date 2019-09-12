/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchOperator } from "../../SearchOperator";
import {
    KIXObjectType, InputFieldTypes, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, TreeNode, KIXObject, DataType, CRUD
} from "../../../model";
import { SearchResultCategory } from "./SearchResultCategory";
import { LabelService } from "../../LabelService";
import { IColumnConfiguration, DefaultColumnConfiguration } from "../../table";
import { AuthenticationSocketClient } from "../../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../model/UIComponentPermission";

export abstract class SearchDefinition {

    public constructor(public objectType: KIXObjectType) { }

    public abstract getProperties(parameter?: Array<[string, any]>): Promise<Array<[string, string]>>;

    public abstract getOperations(property: string, parameter?: Array<[string, any]>): Promise<SearchOperator[]>;

    public abstract getInputFieldType(
        property: string, parameter?: Array<[string, any]>
    ): Promise<InputFieldTypes>;

    public abstract getInputComponents(): Promise<Map<string, string>>;

    public abstract getSearchResultCategories(): Promise<SearchResultCategory>;

    protected readPermissions: Map<string, boolean> = new Map();

    public async getDisplaySearchValue(
        property: string, parameter: Array<[string, any]>, value: any, type: FilterDataType
    ): Promise<string> {
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        return await labelProvider.getPropertyValueDisplayText(property, value);
    }

    public async searchValues(
        property: string, parameter: Array<[string, any]>, searchValue: string, limit: number
    ): Promise<TreeNode[]> {
        return [];
    }

    public async getValueNodesForAutocomplete(
        property: string, values: Array<string | number>, parameter: Array<[string, any]>
    ): Promise<TreeNode[]> {
        return [];
    }

    public async getTreeNodes(property: string, parameter: Array<[string, any]>): Promise<TreeNode[]> {
        return [];
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria);
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return;
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        return criteria.filter((c) => c.value !== null && c.value !== undefined && c.value !== '');
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        return [new FilterCriteria(property, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, value)];
    }

    public async getTableColumnConfiguration(searchParameter: Array<[string, any]>): Promise<IColumnConfiguration[]> {
        const columns: IColumnConfiguration[] = [];
        for (const p of searchParameter) {
            let text = p[1];
            if (!text) {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
                if (labelProvider) {
                    text = await labelProvider.getPropertyText(p[0]);
                }
            }

            columns.push(new DefaultColumnConfiguration(
                p[0], true, false, true, false, 150, true, true, false, DataType.STRING, true)
            );
        }
        return columns;
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

    protected getStringOperators(): SearchOperator[] {
        return [
            SearchOperator.CONTAINS,
            SearchOperator.STARTS_WITH,
            SearchOperator.ENDS_WITH,
            SearchOperator.EQUALS,
            SearchOperator.LIKE
        ];
    }

    protected getDateTimeOperators(): SearchOperator[] {
        return [
            SearchOperator.LESS_THAN,
            SearchOperator.GREATER_THAN,
            SearchOperator.LESS_THAN_OR_EQUAL,
            SearchOperator.GREATER_THAN_OR_EQUAL,
            SearchOperator.BETWEEN
        ];
    }
}
