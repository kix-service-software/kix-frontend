/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQArticleSearchFormManager } from './FAQArticleSearchFormManager';
import { SearchDefinition, SearchResultCategory } from '../../../search/webapp/core';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { FAQArticleProperty } from '../../model/FAQArticleProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { BrowserUtil } from '../../../../modules/base-components/webapp/core/BrowserUtil';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';

export class FAQArticleSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.FAQ_ARTICLE);
        this.formManager = new FAQArticleSearchFormManager();
    }

    public getLoadingOptions(criteria: FilterCriteria[], limit: number): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(
            criteria, null, limit, [KIXObjectProperty.LINKS, FAQArticleProperty.VOTES], [KIXObjectProperty.LINKS]
        );
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(
            null, null, null, [KIXObjectProperty.LINKS, FAQArticleProperty.VOTES], [KIXObjectProperty.LINKS]
        );
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory[]> {
        const categories: SearchResultCategory[] = [];

        if (await this.checkReadPermissions('tickets')) {
            categories.push(
                new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET)
            );
        }
        if (await this.checkReadPermissions('cmdb/configitems')) {
            categories.push(
                new SearchResultCategory('Translatable#Config Items', KIXObjectType.CONFIG_ITEM)
            );
        }

        return [new SearchResultCategory('FAQ', KIXObjectType.FAQ_ARTICLE, categories)];
    }

    public async prepareFormFilterCriteria(
        criteria: FilterCriteria[], forSearch: boolean = true
    ): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria, forSearch);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            criteria = [...criteria, ...this.getFulltextCriteria(value as string)];
        }

        const customerVisibleIndex = criteria.findIndex((c) => c.property === FAQArticleProperty.CUSTOMER_VISIBLE);
        if (customerVisibleIndex !== -1) {
            const value = criteria[customerVisibleIndex].value;
            if (Array.isArray(value) && value.length) {
                criteria.splice(customerVisibleIndex, 1);
                criteria.push(
                    new FilterCriteria(
                        FAQArticleProperty.CUSTOMER_VISIBLE, SearchOperator.EQUALS,
                        FilterDataType.NUMERIC, FilterType.AND, value[0]
                    )
                );
            }
        }
        return criteria;
    }

    public async prepareSearchFormValue(property: string, value: any): Promise<FilterCriteria[]> {
        let criteria = [];
        switch (property) {
            case FAQArticleProperty.NUMBER:
            case FAQArticleProperty.TITLE:
                criteria = [
                    ...criteria,
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                ];
                break;
            case SearchProperty.FULLTEXT:
                criteria = [...criteria, ...this.getFulltextCriteria(value)];
                break;
            case FAQArticleProperty.FIELD_1:
            case FAQArticleProperty.FIELD_2:
            case FAQArticleProperty.FIELD_3:
            case FAQArticleProperty.FIELD_6:
                const preparedCriteria = await super.prepareSearchFormValue(property, value);
                criteria = [...criteria, ...preparedCriteria];

                const encodedValue = BrowserUtil.encodeHTMLString(value);
                const preparedEncodedCriteria = await super.prepareSearchFormValue(property, encodedValue);
                criteria = [...criteria, ...preparedEncodedCriteria];
                break;
            default:
                const prepCriteria = await super.prepareSearchFormValue(property, value);
                criteria = [...criteria, ...prepCriteria];
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

        if (criteria.property === FAQArticleProperty.CREATED || criteria.property === FAQArticleProperty.CHANGED) {
            criteria.type = FilterDataType.DATETIME;
        }

        return criteria;
    }

    public getDefaultSearchCriteria(): string[] {
        return [
            SearchProperty.FULLTEXT,
            FAQArticleProperty.TITLE, FAQArticleProperty.CATEGORY_ID,
            KIXObjectProperty.VALID_ID
        ];
    }
}
