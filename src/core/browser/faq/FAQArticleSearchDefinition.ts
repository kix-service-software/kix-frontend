import {
    KIXObjectType, InputFieldTypes, FilterCriteria, KIXObjectLoadingOptions,
    FilterType, FilterDataType, DataType
} from "../../model";
import { SearchDefinition, SearchResultCategory } from "../kix";
import { SearchOperator } from "../SearchOperator";
import { FAQArticleProperty } from "../../model/kix/faq";
import { ObjectDefinitionSearchAttribute } from "../../model/kix/object-definition";
import { SearchProperty } from "../SearchProperty";
import { ObjectDataService } from "../ObjectDataService";

export class FAQArticleSearchDefinition extends SearchDefinition {

    private searchAttributes: ObjectDefinitionSearchAttribute[];

    public constructor() {
        super(KIXObjectType.FAQ_ARTICLE);

        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData && objectData.objectDefinitions) {
            const faqDef = objectData.objectDefinitions.find((od) => od.Object === KIXObjectType.FAQ_ARTICLE);
            if (faqDef) {
                this.searchAttributes = faqDef.SearchAttributes;
            }
        }
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(null, criteria, null, null, null, ['Links'], ['Links']);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        let properties: Array<[string, string]>;
        if (this.searchAttributes && this.searchAttributes.length) {
            properties = [
                [SearchProperty.FULLTEXT, null],
            ];

            this.searchAttributes
                .filter((sa) => sa.Name !== FAQArticleProperty.CONTENT_TYPE
                    && sa.Name !== FAQArticleProperty.FIELD_4
                    && sa.Name !== FAQArticleProperty.FIELD_5
                    && sa.Name !== FAQArticleProperty.APPROVED
                ).forEach((sa) => properties.push([sa.CorrespondingAttribute, null]));
        } else {
            properties = [
                [SearchProperty.FULLTEXT, null],
                [FAQArticleProperty.TITLE, null],
                [FAQArticleProperty.CATEGORY_ID, null]
            ];
        }
        return properties;
    }

    public async getOperations(property: string): Promise<SearchOperator[]> {
        let operations: SearchOperator[] = [];

        const stringOperators = [
            SearchOperator.CONTAINS,
            SearchOperator.STARTS_WITH,
            SearchOperator.ENDS_WITH,
            SearchOperator.EQUALS,
            SearchOperator.LIKE
        ];

        const numberOperators = [
            SearchOperator.IN,
            SearchOperator.EQUALS
        ];

        if (this.searchAttributes && this.searchAttributes.length) {
            const attribute = this.searchAttributes.find((sa) => sa.CorrespondingAttribute === property);
            if (attribute) {
                operations = attribute.Operators;
            }
        } else {
            if (property === FAQArticleProperty.TITLE) {
                operations = stringOperators;
            } else if (property === FAQArticleProperty.CATEGORY_ID) {
                operations = numberOperators;
            }
        }

        return operations;
    }

    public async getInputFieldType(property: string, parameter?: Array<[string, any]>): Promise<InputFieldTypes> {
        const fieldTypes = new Map<string, InputFieldTypes>();

        if (this.searchAttributes && this.searchAttributes.length) {
            if (this.isDropDown(property)) {
                return InputFieldTypes.DROPDOWN;
            } else if (this.isDateTime(property)) {
                return InputFieldTypes.DATE_TIME;
            }
        }
        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === FAQArticleProperty.APPROVED
            || property === FAQArticleProperty.CATEGORY_ID
            || property === FAQArticleProperty.VALID_ID
            || property === FAQArticleProperty.VISIBILITY
            || property === FAQArticleProperty.LANGUAGE;
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
        const ticketCategory = new SearchResultCategory('Tickets', KIXObjectType.TICKET);
        const ciCategory = new SearchResultCategory('Config Items', KIXObjectType.CONFIG_ITEM);

        return new SearchResultCategory(
            'FAQ', KIXObjectType.FAQ_ARTICLE, [ticketCategory, ciCategory]
        );
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            const objectData = ObjectDataService.getInstance().getObjectData();
            if (objectData) {
                const faqDefinition = objectData.objectDefinitions.find(
                    (od) => od.Object === KIXObjectType.FAQ_ARTICLE
                );

                let faqSearchAttributes: ObjectDefinitionSearchAttribute[] = [];
                if (faqDefinition) {
                    faqSearchAttributes = faqDefinition.SearchAttributes;
                }

                faqSearchAttributes.forEach((sa) => {
                    if (sa.Datatype === DataType.STRING) {
                        criteria.push(
                            new FilterCriteria(
                                sa.CorrespondingAttribute, SearchOperator.CONTAINS,
                                FilterDataType.STRING, FilterType.OR, value
                            )
                        );
                    }
                });
            }
        }
        return criteria;
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        const criteria = [];
        switch (property) {
            case SearchProperty.FULLTEXT:
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
                    FAQArticleProperty.VISIBILITY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                ));
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

}
