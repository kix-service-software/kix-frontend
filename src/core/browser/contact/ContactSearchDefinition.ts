import {
    KIXObjectType, ContactProperty, InputFieldTypes, FilterCriteria, KIXObjectLoadingOptions,
    FilterDataType, FilterType
} from "../../model";
import { SearchDefinition, SearchResultCategory } from "../kix";
import { SearchOperator } from "../SearchOperator";
import { ContextService } from "../context";
import { SearchProperty } from "../SearchProperty";

export class ContactSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CONTACT);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(null, criteria, null, null, null, ['Tickets', 'Contacts'], null);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            const result: Array<[string, string]> = [[SearchProperty.FULLTEXT, null]];
            objectData.contactAttributes.forEach((ca) => result.push([ca[0], null]));
            return result;
        } else {
            return [
                [SearchProperty.FULLTEXT, null],
                [ContactProperty.USER_FIRST_NAME, null],
                [ContactProperty.USER_LAST_NAME, null],
                [ContactProperty.USER_EMAIL, null],
                [ContactProperty.USER_LOGIN, null],
            ];
        }
    }

    public async getOperations(property: string): Promise<SearchOperator[]> {
        let operations: SearchOperator[] = [];

        const stringOperators = [
            SearchOperator.EQUALS,
            SearchOperator.STARTS_WITH,
            SearchOperator.ENDS_WITH,
            SearchOperator.CONTAINS,
            SearchOperator.LIKE
        ];
        const numberOperators = [
            SearchOperator.EQUALS,
            SearchOperator.IN
        ];

        const properties = await this.getProperties();
        if (this.isDropDown(property)) {
            operations = numberOperators;
        } else {
            operations = stringOperators;
        }

        return operations;
    }

    public async getInputFieldType(property: string, parameter?: Array<[string, any]>): Promise<InputFieldTypes> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        }

        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === ContactProperty.VALID_ID;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(ContactProperty.VALID_ID, 'valid-input');
        return components;
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const customerCategory = new SearchResultCategory('Kunden', KIXObjectType.CUSTOMER);
        const ticketCategory = new SearchResultCategory('Tickets', KIXObjectType.TICKET);

        return new SearchResultCategory(
            'Ansprechpartner', KIXObjectType.CONTACT, [customerCategory, ticketCategory]
        );
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            const objectData = ContextService.getInstance().getObjectData();
            if (objectData) {
                objectData.contactAttributes.forEach(
                    (ca) => criteria.push(new FilterCriteria(
                        ca[0], SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                    ))
                );
            }
        }
        return criteria;
    }

}
