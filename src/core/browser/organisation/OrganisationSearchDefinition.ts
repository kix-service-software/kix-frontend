import { SearchDefinition, SearchResultCategory } from "../kix";
import {
    KIXObjectType, OrganisationProperty, InputFieldTypes, FilterCriteria,
    KIXObjectLoadingOptions, KIXObjectProperty
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";
import { OrganisationService } from "./OrganisationService";

export class OrganisationSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.ORGANISATION);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [OrganisationProperty.NAME, null],
            [OrganisationProperty.NUMBER, null],
            [OrganisationProperty.CITY, null],
            [OrganisationProperty.COUNTRY, null],
            [OrganisationProperty.STREET, null],
            [OrganisationProperty.URL, null],
            [OrganisationProperty.ZIP, null]
        ];

        if (await this.checkReadPermissions('system/valid')) {
            properties.push([KIXObjectProperty.VALID_ID, null]);
        }

        return properties;
    }

    public async getOperations(property: string): Promise<SearchOperator[]> {
        let operations: SearchOperator[] = [];

        if (this.isDropDown(property)) {
            operations = [SearchOperator.IN];
        } else {
            operations = this.getStringOperators();
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
        return property === KIXObjectProperty.VALID_ID;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(KIXObjectProperty.VALID_ID, 'valid-input');
        return components;
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const categories: SearchResultCategory[] = [];

        if (await this.checkReadPermissions('contacts')) {
            categories.push(
                new SearchResultCategory('Translatable#Contacts', KIXObjectType.CONTACT)
            );
        }
        if (await this.checkReadPermissions('tickets')) {
            categories.push(
                new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET)
            );
        }

        return new SearchResultCategory('Translatable#Organisations', KIXObjectType.ORGANISATION, categories);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, null, ['Tickets', 'Contacts']);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);
            const filter = await OrganisationService.getInstance().prepareFullTextFilter(value.toString());
            criteria = [...criteria, ...filter];
        }
        return criteria;
    }
}
