/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [ContactProperty.FIRSTNAME, null],
            [ContactProperty.LASTNAME, null],
            [ContactProperty.EMAIL, null],
            [ContactProperty.LOGIN, null],
            [ContactProperty.COUNTRY, null],
            [ContactProperty.STREET, null],
            [ContactProperty.ZIP, null],
            [ContactProperty.CITY, null],
            [ContactProperty.FAX, null],
            [ContactProperty.PHONE, null],
            [ContactProperty.MOBILE, null]
        ];

        if (await this.checkReadPermissions('organisations')) {
            properties.push([ContactProperty.PRIMARY_ORGANISATION_ID, 'Translatable#Assigned Organisation']);
        }

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
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            return InputFieldTypes.OBJECT_REFERENCE;
        } else if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        }

        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === KIXObjectProperty.VALID_ID
            || property === ContactProperty.PRIMARY_ORGANISATION_ID;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(KIXObjectProperty.VALID_ID, 'valid-input');
        return components;
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const categories: SearchResultCategory[] = [];

        if (await this.checkReadPermissions('organisations')) {
            categories.push(
                new SearchResultCategory('Translatable#Organisations', KIXObjectType.ORGANISATION)
            );
        }
        if (await this.checkReadPermissions('tickets')) {
            categories.push(
                new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET)
            );
        }
        return new SearchResultCategory('Translatable#Contacts', KIXObjectType.CONTACT, categories);
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

    public async getValueNodesForAutocomplete(property: string, values: Array<string | number>): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (Array.isArray(values) && !!values.length) {
            switch (property) {
                case ContactProperty.PRIMARY_ORGANISATION_ID:
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, values, null, null, true
                    ).catch((error) => []);
                    for (const o of organisations) {
                        const displayValue = await LabelService.getInstance().getText(o);
                        nodes.push(new TreeNode(o.ID, displayValue, new ObjectIcon(o.KIXObjectType, o.ID)));
                    }
                    break;
                default:
            }
        }
        return nodes;
    }

}
