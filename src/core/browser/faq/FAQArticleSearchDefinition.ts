import {
    KIXObjectType, InputFieldTypes, FilterCriteria, KIXObjectLoadingOptions,
    FilterType, FilterDataType, KIXObjectProperty
} from "../../model";
import { SearchDefinition, SearchResultCategory } from "../kix";
import { SearchOperator } from "../SearchOperator";
import { FAQArticleProperty } from "../../model/kix/faq";
import { SearchProperty } from "../SearchProperty";

export class FAQArticleSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.FAQ_ARTICLE);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, null, ['Links'], ['Links']);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [FAQArticleProperty.NUMBER, null],
            [FAQArticleProperty.TITLE, null],
            [FAQArticleProperty.FIELD_1, null],
            [FAQArticleProperty.FIELD_2, null],
            [FAQArticleProperty.FIELD_3, null],
            [FAQArticleProperty.FIELD_6, null],
            [FAQArticleProperty.CREATED, null],
            [FAQArticleProperty.CHANGED, null]
        ];

        if (await this.checkReadPermissions('system/faq/categories')) {
            properties.push([FAQArticleProperty.CATEGORY_ID, null]);
        }

        if (await this.checkReadPermissions('system/config')) {
            properties.push([FAQArticleProperty.LANGUAGE, null]);
        }

        if (await this.checkReadPermissions('system/valid')) {
            properties.push([KIXObjectProperty.VALID_ID, null]);
        }

        if (await this.checkReadPermissions('faq/articles/keywords')) {
            properties.push([FAQArticleProperty.KEYWORDS, null]);
        }

        if (await this.checkReadPermissions('system/users')) {
            properties.push([FAQArticleProperty.CREATED_BY, null]);
            properties.push([FAQArticleProperty.CHANGED_BY, null]);
        }

        return properties;
    }

    public async getOperations(property: string): Promise<SearchOperator[]> {
        let operations: SearchOperator[] = [];

        if (this.isDropDown(property)) {
            operations = [SearchOperator.IN];
        } else if (this.isDateTime(property)) {
            operations = this.getDateTimeOperators();
        } else {
            operations = this.getStringOperators();
        }

        return operations;
    }

    public async getInputFieldType(property: string, parameter?: Array<[string, any]>): Promise<InputFieldTypes> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            return InputFieldTypes.DATE_TIME;
        }
        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === FAQArticleProperty.APPROVED
            || property === FAQArticleProperty.CATEGORY_ID
            || property === FAQArticleProperty.VALID_ID
            || property === FAQArticleProperty.VISIBILITY
            || property === FAQArticleProperty.LANGUAGE
            || property === FAQArticleProperty.KEYWORDS
            || property === FAQArticleProperty.CREATED_BY
            || property === FAQArticleProperty.CHANGED_BY;
    }

    private isDateTime(property: string): boolean {
        return property === FAQArticleProperty.CREATED
            || property === FAQArticleProperty.CHANGED;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(FAQArticleProperty.VALID_ID, 'valid-input');
        components.set(FAQArticleProperty.CATEGORY_ID, 'faq-category-input');
        components.set(FAQArticleProperty.LANGUAGE, 'language-input');
        components.set(FAQArticleProperty.VISIBILITY, 'faq-visibility-input');
        return components;
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
            case SearchProperty.FULLTEXT:
                criteria = [...criteria, ...this.getFulltextCriteria(value)];
                break;
            case FAQArticleProperty.CATEGORY_ID:
            case FAQArticleProperty.VALID_ID:
                criteria.push(new FilterCriteria(
                    property, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, value
                ));
                break;
            default:
                criteria.push(
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                );
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
                FAQArticleProperty.FIELD_1, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_2, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_3, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.FIELD_6, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.VISIBILITY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                FAQArticleProperty.KEYWORDS, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
        }
        return criteria;
    }
}
