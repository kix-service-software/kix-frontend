/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchResultCategory } from './SearchResultCategory';
import { FilterDataType } from '../../../../model/FilterDataType';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterType } from '../../../../model/FilterType';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { SearchOperator } from '../../model/SearchOperator';
import { DefaultColumnConfiguration } from '../../../../model/configuration/DefaultColumnConfiguration';
import { IColumnConfiguration } from '../../../../model/configuration/IColumnConfiguration';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';
import { SearchCache } from '../../model/SearchCache';
import { SearchProperty } from '../../model/SearchProperty';
import { TicketProperty } from '../../../ticket/model/TicketProperty';

export abstract class SearchDefinition {

    public formManager: AbstractDynamicFormManager;

    protected extendedDefinitions: SearchDefinition[] = [];

    public addExtendedDefinitions(definition: SearchDefinition): void {
        this.extendedDefinitions.push(definition);
    }

    public createFormManager(
        ignoreProperties: string[] = [], validDynamicFields: boolean = true
    ): SearchFormManager {
        return null;
    }

    public constructor(public objectType: KIXObjectType | string) { }

    public async getProperties(parameter?: Array<[string, any]>): Promise<Array<[string, string]>> {
        return await this.formManager.getProperties();
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory[]> {
        return [];
    }

    protected readPermissions: Map<string, boolean> = new Map();

    public async getDisplaySearchValue(
        property: string, parameter: Array<[string, any]>, value: any, type: FilterDataType
    ): Promise<string> {
        let displayValue;
        for (const definition of this.extendedDefinitions) {
            const extendedValue = await definition.getDisplaySearchValue(property, parameter, value, type);
            if (extendedValue) {
                displayValue = extendedValue;
            }
        }

        return displayValue
            ? displayValue
            : await LabelService.getInstance().getPropertyValueDisplayText(this.objectType, property, value);
    }

    public async searchValues(
        property: string, parameter: Array<[string, any]>, searchValue: string, limit: number
    ): Promise<TreeNode[]> {
        return [];
    }

    public getLoadingOptions(criteria: FilterCriteria[], limit: number): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, limit);
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return null;
    }

    public async prepareFormFilterCriteria(
        criteria: FilterCriteria[], forSearch: boolean = true
    ): Promise<FilterCriteria[]> {
        const filteredCriteria = criteria.filter((c) => {
            if (Array.isArray(c.value)) {
                return c.value.length > 0;
            } else {
                return c.value !== null && c.value !== undefined && c.value !== '';
            }
        });

        for (const c of filteredCriteria) {
            const dfName = KIXObjectService.getDynamicFieldName(c.property);
            if (dfName) {
                const field = await KIXObjectService.loadDynamicField(dfName);
                if (field) {
                    if (field.FieldType === DynamicFieldTypes.DATE) {
                        c.type = FilterDataType.DATE;
                    } else if (field.FieldType === DynamicFieldTypes.DATE_TIME) {
                        c.type = FilterDataType.DATETIME;
                    }
                }
            }
        }

        return filteredCriteria;
    }

    public async prepareSearchFormValue(property: string, value: any): Promise<FilterCriteria[]> {
        const operator = Array.isArray(value) ? SearchOperator.IN : SearchOperator.EQUALS;

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const field = await KIXObjectService.loadDynamicField(dfName);
            if (field) {
                if (field.FieldType === DynamicFieldTypes.DATE) {
                    return [new FilterCriteria(
                        property, operator, FilterDataType.DATE, FilterType.AND, value
                    )];
                } else if (field.FieldType === DynamicFieldTypes.DATE_TIME) {
                    return [new FilterCriteria(
                        property, operator, FilterDataType.DATETIME, FilterType.AND, value
                    )];
                }
            }
        }

        return [new FilterCriteria(property, operator, FilterDataType.STRING, FilterType.AND, value)];
    }

    public async getTableColumnConfigurations(cache: SearchCache): Promise<IColumnConfiguration[]> {
        const parameter: Array<[string, any]> = [];
        for (const c of cache?.criteria) {
            if (c.property !== SearchProperty.FULLTEXT &&
                c.property !== TicketProperty.CLOSE_TIME &&
                c.property !== TicketProperty.LAST_CHANGE_TIME) {
                parameter.push([c.property, c.value]);
            }
        }
        const columns = await this.getTableColumnConfiguration(parameter);
        return columns;
    }

    public async getTableColumnConfiguration(searchParameter: Array<[string, any]>): Promise<IColumnConfiguration[]> {
        const columns: IColumnConfiguration[] = [];
        for (const p of searchParameter) {
            const tableFactory = TableFactoryService.getInstance().getTableFactory(this.objectType);
            if (tableFactory) {
                columns.push(tableFactory.getDefaultColumnConfiguration(p[0]));
            } else {
                columns.push(new DefaultColumnConfiguration(null, null, null,
                    p[0], true, false, true, false, 150, true, true)
                );
            }
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
            SearchOperator.BETWEEN,
            SearchOperator.WITHIN_THE_LAST,
            SearchOperator.WITHIN_THE_NEXT,
            SearchOperator.WITHIN,
            SearchOperator.MORE_THAN_AGO,
            SearchOperator.IN_MORE_THAN,
            SearchOperator.LESS_THAN_AGO,
            SearchOperator.IN_LESS_THAN
        ];
    }

    public static getRelativeDateTimeOperators(): SearchOperator[] {
        return [
            SearchOperator.WITHIN_THE_LAST,
            SearchOperator.WITHIN_THE_NEXT,
            SearchOperator.WITHIN,
            SearchOperator.MORE_THAN_AGO,
            SearchOperator.IN_MORE_THAN,
            SearchOperator.LESS_THAN_AGO,
            SearchOperator.IN_LESS_THAN,
        ];
    }

    public static getNumberOperators(): SearchOperator[] {
        return [
            SearchOperator.EQUALS,
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

    public getDefaultSearchCriteria(): string[] {
        return [];
    }

}
