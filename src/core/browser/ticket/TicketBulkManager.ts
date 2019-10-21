/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BulkManager } from "../bulk";
import {
    KIXObjectType, InputFieldTypes, TicketProperty, TreeNode, KIXObjectLoadingOptions,
    ObjectIcon, Contact, SortUtil, Organisation, FilterCriteria, KIXObjectProperty, FilterDataType, FilterType
} from "../../model";
import { LabelService } from "../LabelService";
import { ObjectDefinitionUtil, KIXObjectService } from "../kix";
import { TicketService } from "./TicketService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { PropertyOperator } from "../PropertyOperator";
import { ContactService } from "../contact";
import { KIXModulesSocketClient } from "../modules/KIXModulesSocketClient";
import { SearchOperator } from "../SearchOperator";

export class TicketBulkManager extends BulkManager {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    public reset(): void {
        super.reset(false);
        this.values.push(new ObjectPropertyValue(TicketProperty.QUEUE_ID, PropertyOperator.CHANGE, null));
        this.values.push(new ObjectPropertyValue(TicketProperty.TYPE_ID, PropertyOperator.CHANGE, null));
        this.notifyListeners();
    }

    public async getOperations(property: string): Promise<PropertyOperator[]> {
        const operations = [PropertyOperator.CHANGE];

        if (property) {
            switch (property) {
                case TicketProperty.TITLE:
                case TicketProperty.CONTACT_ID:
                case TicketProperty.ORGANISATION_ID:
                case TicketProperty.QUEUE_ID:
                case TicketProperty.OWNER_ID:
                case TicketProperty.RESPONSIBLE_ID:
                case TicketProperty.PRIORITY_ID:
                case TicketProperty.STATE_ID:
                case TicketProperty.TYPE_ID:
                    break;
                default:
                    operations.push(PropertyOperator.CLEAR);
            }
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        const objectDefinitions = await KIXModulesSocketClient.getInstance().loadObjectDefinitions();
        const ticketDefinition = objectDefinitions.find((od) => od.Object === this.objectType);
        if (ticketDefinition) {
            switch (property) {
                case TicketProperty.CONTACT_ID:
                    return InputFieldTypes.OBJECT_REFERENCE;
                case TicketProperty.QUEUE_ID:
                case TicketProperty.STATE_ID:
                case TicketProperty.TYPE_ID:
                case TicketProperty.PRIORITY_ID:
                case TicketProperty.SERVICE_ID:
                case TicketProperty.SLA_ID:
                case TicketProperty.RESPONSIBLE_ID:
                case TicketProperty.OWNER_ID:
                case TicketProperty.LOCK_ID:
                case TicketProperty.ORGANISATION_ID:
                    return InputFieldTypes.DROPDOWN;
                case TicketProperty.PENDING_TIME:
                    return InputFieldTypes.DATE_TIME;
                default:
                    return ObjectDefinitionUtil.getAttributeFieldType(ticketDefinition, property);
            }
        }

        return InputFieldTypes.TEXT;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        const properties: Array<[string, string]> = [
            [TicketProperty.CONTACT_ID, await labelProvider.getPropertyText(TicketProperty.CONTACT_ID)],
            [TicketProperty.ORGANISATION_ID, await labelProvider.getPropertyText(TicketProperty.ORGANISATION_ID)],
            [TicketProperty.LOCK_ID, await labelProvider.getPropertyText(TicketProperty.LOCK_ID)],
            [TicketProperty.OWNER_ID, await labelProvider.getPropertyText(TicketProperty.OWNER_ID)],
            [TicketProperty.PRIORITY_ID, await labelProvider.getPropertyText(TicketProperty.PRIORITY_ID)],
            [TicketProperty.QUEUE_ID, await labelProvider.getPropertyText(TicketProperty.QUEUE_ID)],
            [TicketProperty.RESPONSIBLE_ID, await labelProvider.getPropertyText(TicketProperty.RESPONSIBLE_ID)],
            // [TicketProperty.SERVICE_ID, await labelProvider.getPropertyText(TicketProperty.SERVICE_ID)],
            // [TicketProperty.SLA_ID, await labelProvider.getPropertyText(TicketProperty.SLA_ID)],
            [TicketProperty.STATE_ID, await labelProvider.getPropertyText(TicketProperty.STATE_ID)],
            [TicketProperty.PENDING_TIME, await labelProvider.getPropertyText(TicketProperty.PENDING_TIME)],
            [TicketProperty.TITLE, await labelProvider.getPropertyText(TicketProperty.TITLE)],
            [TicketProperty.TYPE_ID, await labelProvider.getPropertyText(TicketProperty.TYPE_ID)],
        ];

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async isHiddenProperty(property: string): Promise<boolean> {
        return property === TicketProperty.ORGANISATION_ID || property === TicketProperty.PENDING_TIME;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        switch (property) {
            case TicketProperty.CONTACT_ID:
                const filter = await ContactService.getInstance().prepareFullTextFilter(searchValue);
                const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, null, loadingOptions, null, false
                );
                const nodes = [];
                for (const c of contacts) {
                    const displayValue = await LabelService.getInstance().getText(c);
                    nodes.push(new TreeNode(c.ID, displayValue, new ObjectIcon(c.KIXObjectType, c.ID)));
                }
                return nodes;
            default:
        }

        return [];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        switch (property) {
            case TicketProperty.ORGANISATION_ID:
                const organisationValue = this.values.find((bv) => bv.property === TicketProperty.ORGANISATION_ID);
                if (organisationValue) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION,
                        Array.isArray(organisationValue.value) ? organisationValue.value : [organisationValue.value],
                        undefined, undefined, true
                    ).catch(() => [] as Organisation[]);
                    if (organisations && !!organisations.length) {
                        const displayValue = await LabelService.getInstance().getText(organisations[0]);
                        nodes.push(new TreeNode(
                            organisations[0].ID, displayValue,
                            new ObjectIcon(KIXObjectType.ORGANISATION, organisations[0].ID)
                        ));
                    } else {
                        const orgStringValue = Array.isArray(organisationValue.value)
                            ? organisationValue.value[0].toString() : organisationValue.value.toString();
                        nodes.push(new TreeNode(
                            orgStringValue, orgStringValue, new ObjectIcon(KIXObjectType.ORGANISATION, orgStringValue)
                        ));
                    }
                }
                break;
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                const loadingOptions = new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        )
                    ], undefined, undefined, undefined, undefined,
                    [
                        ['requiredPermission', 'TicketRead,TicketUpdate']
                    ]
                );
                nodes = await TicketService.getInstance().getTreeNodes(property, false, undefined, loadingOptions);
                break;
            default:
                nodes = await TicketService.getInstance().getTreeNodes(property);
        }
        return nodes;
    }

    protected async checkProperties(): Promise<void> {
        await this.checkContactValue();
        await this.checkStateValue();
    }

    private async checkContactValue(): Promise<void> {
        const contactValue = this.values.find((bv) => bv.property === TicketProperty.CONTACT_ID);
        if (contactValue) {
            contactValue.objectType = KIXObjectType.CONTACT;
            const contactValueForUse = !contactValue.value ? null
                : Array.isArray(contactValue.value) ? contactValue.value : [contactValue.value];
            if (contactValueForUse && !!contactValueForUse.length) {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, contactValueForUse, undefined, undefined, true
                ).catch(() => [] as Contact[]);
                let orgId = contactValueForUse[0];
                if (contacts && !!contacts.length) {
                    orgId = contacts[0].PrimaryOrganisationID;
                }
                const value = new ObjectPropertyValue(
                    TicketProperty.ORGANISATION_ID, PropertyOperator.CHANGE, orgId, false, true,
                    KIXObjectType.ORGANISATION, true, false
                );
                const organisationValueIndex = this.values.findIndex(
                    (bv) => bv.property === TicketProperty.ORGANISATION_ID
                );
                if (organisationValueIndex === -1) {
                    const index = this.values.findIndex(
                        (bv) => bv.property === TicketProperty.CONTACT_ID
                    );
                    this.values.splice(index + 1, 0, value);
                } else {
                    this.values[organisationValueIndex].value = value.value;
                }
            } else {
                await this.deleteValue(TicketProperty.ORGANISATION_ID);
            }
        } else {
            await this.deleteValue(TicketProperty.ORGANISATION_ID);
        }
    }

    private async checkStateValue(): Promise<void> {
        const stateValue = this.values.find((bv) => bv.property === TicketProperty.STATE_ID);
        if (stateValue && stateValue.value) {
            const stateValueForUse = Array.isArray(stateValue.value) ? stateValue.value[0] : stateValue.value;
            const pendingState = stateValueForUse
                ? await TicketService.getInstance().isPendingState(Number(stateValueForUse)) : null;
            if (pendingState) {
                const pendingValueIndex = this.values.findIndex((bv) => bv.property === TicketProperty.PENDING_TIME);
                const value = new ObjectPropertyValue(
                    TicketProperty.PENDING_TIME, PropertyOperator.CHANGE, null, false, true, null, true, true
                );
                if (pendingValueIndex === -1) {
                    const index = this.values.findIndex((bv) => bv.property === TicketProperty.STATE_ID);
                    this.values.splice(index + 1, 0, value);
                }
            } else {
                await this.deleteValue(TicketProperty.PENDING_TIME);
            }
        } else {
            await this.deleteValue(TicketProperty.PENDING_TIME);
        }
    }

    private async deleteValue(property: string): Promise<void> {
        const value = this.values.find((bv) => bv.property === property);
        if (value) {
            await this.removeValue(value);
        }
    }
}
