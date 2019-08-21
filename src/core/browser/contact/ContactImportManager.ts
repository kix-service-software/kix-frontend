/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, InputFieldTypes, TreeNode, SortUtil, ContactProperty,
    Contact, KIXObjectLoadingOptions, Organisation, ObjectIcon, KIXObjectProperty, KIXObject,
    FilterCriteria, FilterDataType, FilterType, OrganisationProperty
} from "../../model";
import { LabelService } from "../LabelService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportManager, ImportPropertyOperator } from "../import";
import { ContactService } from "./ContactService";
import { KIXObjectService } from "../kix";
import { OrganisationService } from "../organisation";
import { SearchOperator } from "../SearchOperator";

export class ContactImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public reset(): void {
        super.reset();
        this.values.push(new ObjectPropertyValue(
            KIXObjectProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, [1])
        );
    }

    protected async getSpecificObject(object: {}): Promise<Contact> {
        if (object[ContactProperty.PRIMARY_ORGANISATION_ID]) {
            object[ContactProperty.PRIMARY_ORGANISATION_ID] = Number(object[ContactProperty.PRIMARY_ORGANISATION_ID]);
        } else if (object[ContactProperty.PRIMARY_ORGANISATION_NUMBER]) {
            const organisation = await this.getOrganisationByNumber(
                object[ContactProperty.PRIMARY_ORGANISATION_NUMBER]
            );
            if (organisation) {
                object[ContactProperty.PRIMARY_ORGANISATION_ID] = organisation.ID;
            }
        }
        return new Contact(object as Contact);
    }

    private async getOrganisationByNumber(number: string): Promise<Organisation> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    OrganisationProperty.NUMBER, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, number
                )
            ]
        );
        const primaryOrganisations = await KIXObjectService.loadObjects<Organisation>(
            KIXObjectType.ORGANISATION, null, loadingOptions, null, true
        ).catch((error) => console.log(error));
        return primaryOrganisations && !!primaryOrganisations.length ? primaryOrganisations[0] : null;
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                return InputFieldTypes.DROPDOWN;
            case ContactProperty.COMMENT:
                return InputFieldTypes.TEXT_AREA;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                return InputFieldTypes.OBJECT_REFERENCE;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: ContactProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case ContactProperty.COMMENT:
                return [
                    ['maxLength', 250]
                ];
            default:
                return super.getInputTypeOptions(property, operator);
        }
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        const attributes = [
            ContactProperty.PASSWORD,
            ContactProperty.PRIMARY_ORGANISATION_ID,
            ContactProperty.FIRSTNAME,
            ContactProperty.LASTNAME,
            ContactProperty.TITLE,
            ContactProperty.EMAIL,
            ContactProperty.PHONE,
            ContactProperty.MOBILE,
            ContactProperty.FAX,
            ContactProperty.STREET,
            ContactProperty.CITY,
            ContactProperty.ZIP,
            ContactProperty.COUNTRY,
            ContactProperty.COMMENT,
            KIXObjectProperty.VALID_ID
        ];
        for (const attribute of attributes) {
            const label = await labelProvider.getPropertyText(attribute);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [ContactProperty.LOGIN, ContactProperty.PRIMARY_ORGANISATION_ID];
    }

    public getAlternativeProperty(property: string): string {
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            return ContactProperty.PRIMARY_ORGANISATION_NUMBER;
        } else {
            return super.getAlternativeProperty(property);
        }
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        switch (property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                const filter = await OrganisationService.getInstance().prepareFullTextFilter(searchValue);
                const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, null, loadingOptions, null, false
                );

                const nodes = [];
                for (const o of organisations) {
                    const displayValue = await LabelService.getInstance().getText(o);
                    nodes.push(new TreeNode(o.ID, displayValue, new ObjectIcon(o.KIXObjectType, o.ID)));
                }
                return nodes;
            default:
        }

        return [];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await ContactService.getInstance().getTreeNodes(property);
    }

    protected async getExisting(contact: Contact): Promise<KIXObject> {
        if (contact.ObjectId) {
            return super.getExisting(contact);
        } else {
            const filter = [
                new FilterCriteria(
                    ContactProperty.LOGIN, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, contact.Login
                )
            ];
            const loadingOptions = new KIXObjectLoadingOptions(filter);
            const contacts = await KIXObjectService.loadObjects(
                this.objectType, null, loadingOptions, null, true
            );
            return contacts && !!contacts.length ? contacts[0] : null;
        }
    }
}
