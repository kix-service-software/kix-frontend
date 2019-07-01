import {
    KIXObjectType, ContactProperty, InputFieldTypes, FilterCriteria, KIXObjectLoadingOptions,
    KIXObjectProperty, TreeNode, Organisation, ObjectIcon
} from "../../model";
import { SearchDefinition, SearchResultCategory, KIXObjectService } from "../kix";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";
import { ContactService } from "./ContactService";
import { OrganisationService } from "../organisation";
import { LabelService } from "../LabelService";

export class ContactSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CONTACT);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, null, ['Tickets'], null);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        return [
            [SearchProperty.FULLTEXT, null],
            [ContactProperty.FIRST_NAME, null],
            [ContactProperty.LAST_NAME, null],
            [ContactProperty.EMAIL, null],
            [ContactProperty.LOGIN, null],
            [ContactProperty.PRIMARY_ORGANISATION_ID, null],
            [ContactProperty.COUNTRY, null],
            [ContactProperty.STREET, null],
            [ContactProperty.ZIP, null],
            [ContactProperty.CITY, null],
            [ContactProperty.FAX, null],
            [ContactProperty.PHONE, null],
            [ContactProperty.MOBILE, null],
        ];
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
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            return InputFieldTypes.OBJECT_REFERENCE;
        } else if (this.isDropDown(property)) {
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
        const organisationCategory = new SearchResultCategory('Translatable#Organisations', KIXObjectType.ORGANISATION);
        const ticketCategory = new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET);

        return new SearchResultCategory(
            'Translatable#Contacts', KIXObjectType.CONTACT, [organisationCategory, ticketCategory]
        );
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);
            const filter = await ContactService.getInstance().prepareFullTextFilter(value.toString());
            criteria = [...criteria, ...filter];
        }
        return criteria;
    }

    public async searchValues(
        property: string, parameter: Array<[string, any]>, searchValue: string, limit: number
    ): Promise<TreeNode[]> {
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            const filter = await OrganisationService.getInstance().prepareFullTextFilter(searchValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, null, loadingOptions, null, false
            );
            const nodes = [];
            for (const c of organisations) {
                const displayValue = await LabelService.getInstance().getText(c);
                nodes.push(new TreeNode(c.ID, displayValue, new ObjectIcon(c.KIXObjectType, c.ID)));
            }
            return nodes;
        }
    }

}
