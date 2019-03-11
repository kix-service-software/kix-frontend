import { SearchDefinition, SearchResultCategory } from "../kix";
import {
    KIXObjectType, CustomerProperty, InputFieldTypes, FilterCriteria,
    KIXObjectLoadingOptions, FilterDataType, FilterType
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";
import { ObjectDataService } from "../ObjectDataService";

export class CustomerSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CUSTOMER);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            const result: Array<[string, string]> = [[SearchProperty.FULLTEXT, null]];
            objectData.customerAttributes.forEach((ca) => result.push([ca[0], null]));
            return result;
        } else {
            return [
                [SearchProperty.FULLTEXT, null],
                [CustomerProperty.CUSTOMER_COMPANY_NAME, null]
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
        return property === CustomerProperty.VALID_ID;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(CustomerProperty.VALID_ID, 'valid-input');
        return components;
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const contactCategory = new SearchResultCategory('Contacts', KIXObjectType.CONTACT);
        const ticketCategory = new SearchResultCategory('Tickets', KIXObjectType.TICKET);

        return new SearchResultCategory(
            'Kunden', KIXObjectType.CUSTOMER, [contactCategory, ticketCategory]
        );
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(null, criteria, null, null, null, ['Tickets', 'Contacts']);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            const objectData = ObjectDataService.getInstance().getObjectData();
            if (objectData) {
                objectData.customerAttributes.forEach(
                    (ca) => criteria.push(new FilterCriteria(
                        ca[0], SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                    ))
                );
            }
        }
        return criteria;
    }
}
