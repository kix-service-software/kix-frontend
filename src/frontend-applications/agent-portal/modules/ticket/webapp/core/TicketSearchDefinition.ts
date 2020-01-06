/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchDefinition, SearchResultCategory } from "../../../search/webapp/core";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TicketSearchFormManager } from "./TicketSearchFormManager";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { SearchProperty } from "../../../search/model/SearchProperty";
import { TicketProperty } from "../../model/TicketProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { ObjectPropertyValue } from "../../../../model/ObjectPropertyValue";

export class TicketSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.TICKET);
        this.formManager = new TicketSearchFormManager();
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, null, ['Watchers', 'Links'], ['Links']);
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(null, null, null, ['Watchers']);
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const categories: SearchResultCategory[] = [];

        if (await this.checkReadPermissions('contacts')) {
            categories.push(
                new SearchResultCategory('Translatable#Contacts', KIXObjectType.CONTACT)
            );
        }
        if (await this.checkReadPermissions('organisations')) {
            categories.push(
                new SearchResultCategory('Translatable#Organisations', KIXObjectType.ORGANISATION)
            );
        }
        if (await this.checkReadPermissions('cmdb/configitems')) {
            categories.push(
                new SearchResultCategory('Translatable#Config Items', KIXObjectType.CONFIG_ITEM)
            );
        }

        return new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET, categories);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            criteria = [...criteria, ...this.getFulltextCriteria(value as string)];
        }

        const lockIndex = criteria.findIndex((c) => c.property === TicketProperty.LOCK_ID);
        if (lockIndex !== -1 && criteria[lockIndex].value && Array.isArray(criteria[lockIndex].value)) {
            criteria[lockIndex].value = criteria[lockIndex].value[0];
        }

        return criteria;
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        let criteria = [];
        switch (property) {
            case TicketProperty.TICKET_NUMBER:
            case TicketProperty.TITLE:
                criteria = [
                    ...criteria,
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                ];
                break;
            case SearchProperty.FULLTEXT:
                criteria = [...criteria, ...this.getFulltextCriteria(value)];
                break;
            default:
                criteria = [...criteria, ...super.prepareSearchFormValue(property, value)];
        }

        return criteria;
    }

    private getFulltextCriteria(value: string): FilterCriteria[] {
        const criteria: FilterCriteria[] = [];
        if (value) {
            criteria.push(new FilterCriteria(
                TicketProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
        }
        return criteria;

    }

    public getFilterCriteria(searchValue: ObjectPropertyValue): FilterCriteria {
        const criteria = super.getFilterCriteria(searchValue);

        if (criteria.property === TicketProperty.CREATED
            || criteria.property === TicketProperty.CHANGED
            || criteria.property === TicketProperty.CLOSE_TIME
            || criteria.property === TicketProperty.PENDING_TIME
            || criteria.property === TicketProperty.LAST_CHANGE_TIME
        ) {
            criteria.type = FilterDataType.DATETIME;
        }

        return criteria;
    }
}
