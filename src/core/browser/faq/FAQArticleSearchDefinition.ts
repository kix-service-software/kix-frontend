/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, FilterCriteria, KIXObjectLoadingOptions, FilterType, FilterDataType
} from "../../model";
import { SearchDefinition, SearchResultCategory } from "../kix";
import { SearchOperator } from "../SearchOperator";
import { FAQArticleProperty } from "../../model/kix/faq";
import { SearchProperty } from "../SearchProperty";
import { FAQArticleSearchFormManager } from "./FAQArticleSearchFormManager";
import { BrowserUtil } from "../BrowserUtil";
import { ObjectPropertyValue } from "../ObjectPropertyValue";

export class FAQArticleSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.FAQ_ARTICLE);
        this.formManager = new FAQArticleSearchFormManager();
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, null, ['Links', 'Votes'], ['Links']);
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(null, null, null, ['Links', 'Votes'], ['Links']);
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
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

        return new SearchResultCategory('FAQ', KIXObjectType.FAQ_ARTICLE, categories);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            criteria = [...criteria, ...this.getFulltextCriteria(value as string)];
        }
        return criteria;
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
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
                criteria = [...criteria, ...super.prepareSearchFormValue(property, value)];
                const encodedValue = BrowserUtil.encodeHTMLString(value);
                criteria = [...criteria, ...super.prepareSearchFormValue(property, encodedValue)];
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
                FAQArticleProperty.NUMBER, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.TITLE, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.LANGUAGE, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));

            criteria.push(new FilterCriteria(
                FAQArticleProperty.KEYWORDS, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));

            const encodedValue = BrowserUtil.encodeHTMLString(value);

            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_1, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_1, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, encodedValue
            ));

            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_2, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_2, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, encodedValue
            ));

            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_3, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_3, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, encodedValue
            ));

            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_6, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_6, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, encodedValue
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
}
