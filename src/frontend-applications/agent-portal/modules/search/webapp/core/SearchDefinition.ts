/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { SearchResultCategory } from "./SearchResultCategory";
import { FilterDataType } from "../../../../model/FilterDataType";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { TreeNode } from "../../../base-components/webapp/core/tree";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterType } from "../../../../model/FilterType";
import { DataType } from "../../../../model/DataType";
import { AuthenticationSocketClient } from "../../../../modules/base-components/webapp/core/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../server/model/rest/CRUD";
import { ObjectPropertyValue } from "../../../../model/ObjectPropertyValue";
import { IDynamicFormManager } from "../../../base-components/webapp/core/dynamic-form/IDynamicFormManager";
import { SearchOperator } from "../../model/SearchOperator";
import { DefaultColumnConfiguration } from "../../../../model/configuration/DefaultColumnConfiguration";
import { IColumnConfiguration } from "../../../../model/configuration/IColumnConfiguration";
import { DynamicFieldService } from "../../../dynamic-fields/webapp/core/DynamicFieldService";

export abstract class SearchDefinition {

    public formManager: IDynamicFormManager;

    public constructor(public objectType: KIXObjectType | string) { }

    public async getProperties(parameter?: Array<[string, any]>): Promise<Array<[string, string]>> {
        return await this.formManager.getProperties();
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        return null;
    }

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

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria);
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return null;
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        const filteredCriteria = criteria.filter((c) => {
            if (Array.isArray(c.value)) {
                return c.value.length > 0;
            } else {
                return c.value !== null && c.value !== undefined && c.value !== '';
            }
        });

        for (const c of filteredCriteria) {
            const field = await DynamicFieldService.loadDynamicField(c.property);
            if (field) {
                if (field.FieldType === 'Date') {
                    c.type = FilterDataType.DATE;
                } else if (field.FieldType === 'DateTime') {
                    c.type = FilterDataType.DATETIME;
                }
            }
        }

        return filteredCriteria;
    }

    public async prepareSearchFormValue(property: string, value: any): Promise<FilterCriteria[]> {
        const operator = Array.isArray(value) ? SearchOperator.IN : SearchOperator.EQUALS;

        const field = await DynamicFieldService.loadDynamicField(property);
        if (field) {
            if (field.FieldType === 'Date') {
                return [new FilterCriteria(
                    property, operator, FilterDataType.DATE, FilterType.AND, value
                )];
            } else if (field.FieldType === 'DateTime') {
                return [new FilterCriteria(
                    property, operator, FilterDataType.DATETIME, FilterType.AND, value
                )];
            }
        }

        return [new FilterCriteria(property, operator, FilterDataType.STRING, FilterType.AND, value)];
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

            columns.push(new DefaultColumnConfiguration(null, null, null,
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

    public static getStringOperators(): SearchOperator[] {
        return [
            SearchOperator.CONTAINS,
            SearchOperator.STARTS_WITH,
            SearchOperator.ENDS_WITH,
            SearchOperator.EQUALS,
            SearchOperator.LIKE
        ];
    }

    public static getDateTimeOperators(): SearchOperator[] {
        return [
            SearchOperator.LESS_THAN,
            SearchOperator.GREATER_THAN,
            SearchOperator.LESS_THAN_OR_EQUAL,
            SearchOperator.GREATER_THAN_OR_EQUAL,
            SearchOperator.BETWEEN
        ];
    }

    public getFilterCriteria(searchValue: ObjectPropertyValue): FilterCriteria {
        const property = searchValue.property;
        const operator = searchValue.operator;
        const value = searchValue.value;
        const filterDataType = operator === SearchOperator.BETWEEN ? FilterDataType.DATETIME : FilterDataType.STRING;

        return new FilterCriteria(property, operator as SearchOperator, filterDataType, FilterType.AND, value);
    }

}
