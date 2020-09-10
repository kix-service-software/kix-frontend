/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchResultCategory } from '../../../search/webapp/core/SearchResultCategory';
import { SearchDefinition } from '../../../search/webapp/core/SearchDefinition';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TicketSearchFormManager } from './TicketSearchFormManager';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { TicketProperty } from '../../model/TicketProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';

export class TicketSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.TICKET);
        this.formManager = new TicketSearchFormManager();
    }

    public createFormManager(): SearchFormManager {
        const newManager = new TicketSearchFormManager();

        this.formManager.getExtendedFormManager().forEach((m) => newManager.addExtendedFormManager(m));
        return newManager;
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(
            null, null, null, [TicketProperty.WATCHERS]
        );
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

    public async prepareSearchFormValue(property: string, value: any): Promise<FilterCriteria[]> {
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
                const preparedCriteria = await super.prepareSearchFormValue(property, value);
                criteria = [...criteria, ...preparedCriteria];
        }

        return criteria;
    }

    private getFulltextCriteria(value: string): FilterCriteria[] {
        const criteria: FilterCriteria[] = [];
        if (value) {
            criteria.push(new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
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

        if (criteria.property === TicketProperty.LOCK_ID && Array.isArray(criteria.value)) {
            criteria.value = criteria.value[0];
        }

        return criteria;
    }
}
