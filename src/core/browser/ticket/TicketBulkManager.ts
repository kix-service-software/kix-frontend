import { BulkManager } from "../bulk";
import {
    KIXObjectType, InputFieldTypes, TicketProperty, TreeNode, KIXObjectLoadingOptions,
    ObjectIcon, Contact, SortUtil
} from "../../model";
import { LabelService } from "../LabelService";
import { ObjectDefinitionUtil, KIXObjectService } from "../kix";
import { TicketService } from "./TicketService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { PropertyOperator } from "../PropertyOperator";
import { ObjectDataService } from "../ObjectDataService";
import { ContactService } from "../contact";

export class TicketBulkManager extends BulkManager {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    public reset(): void {
        super.reset();
        this.bulkValues.push(new ObjectPropertyValue(TicketProperty.QUEUE_ID, PropertyOperator.CHANGE, null));
        this.bulkValues.push(new ObjectPropertyValue(TicketProperty.TYPE_ID, PropertyOperator.CHANGE, null));
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
        const objectData = ObjectDataService.getInstance().getObjectData();
        const ticketDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
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
        const properties: Array<[string, string]> = [];
        const objectData = ObjectDataService.getInstance().getObjectData();
        const ticketDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        if (ticketDefinition) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
            const attributes = ticketDefinition.Attributes.filter((a) =>
                !a.ReadOnly
                && a.Name !== TicketProperty.PENDING_TIME
                && a.Name !== TicketProperty.ORGANISATION_ID
            );
            for (const attribute of attributes) {
                const label = await labelProvider.getPropertyText(attribute.Name);
                properties.push([attribute.Name, label]);
            }
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        switch (property) {
            case TicketProperty.CONTACT_ID:
                const loadingOptions = new KIXObjectLoadingOptions(
                    ContactService.getInstance().prepareFullTextFilter(searchValue), null, limit
                );
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
        return await TicketService.getInstance().getTreeNodes(property);
    }

    protected async checkProperties(): Promise<void> {
        await this.checkContactValue();
        await this.checkStateValue();
    }

    private async checkContactValue(): Promise<void> {
        const contactValue = this.bulkValues.find((bv) => bv.property === TicketProperty.CONTACT_ID);
        if (contactValue) {
            contactValue.objectType = KIXObjectType.CONTACT;
            if (contactValue.value) {
                const organisationValue = this.bulkValues.find((bv) => bv.property === TicketProperty.ORGANISATION_ID);
                if (!organisationValue) {
                    const contacts = await KIXObjectService.loadObjects<Contact>(
                        KIXObjectType.CONTACT, [contactValue.value.toString()]
                    );
                    if (contacts && contacts.length) {
                        const orgId = contacts[0].PrimaryOrganisationID;
                        const value = new ObjectPropertyValue(
                            TicketProperty.ORGANISATION_ID, PropertyOperator.CHANGE, orgId,
                            KIXObjectType.ORGANISATION, true, false
                        );
                        const index = this.bulkValues.findIndex(
                            (bv) => bv.property === TicketProperty.CONTACT_ID
                        );
                        this.bulkValues.splice(index + 1, 0, value);
                    }
                }
            } else {
                await this.deleteValue(TicketProperty.ORGANISATION_ID);
            }
        } else {
            await this.deleteValue(TicketProperty.ORGANISATION_ID);
        }
    }

    private async checkStateValue(): Promise<void> {
        const stateValue = this.bulkValues.find((bv) => bv.property === TicketProperty.STATE_ID);
        if (stateValue && stateValue.value) {
            const pendingState = await TicketService.getInstance().isPendingState(Number(stateValue.value));
            if (pendingState) {
                const pendingValue = this.bulkValues.find((bv) => bv.property === TicketProperty.PENDING_TIME);
                if (!pendingValue) {
                    const value = new ObjectPropertyValue(
                        TicketProperty.PENDING_TIME, PropertyOperator.CHANGE, null, null, true, true
                    );
                    const index = this.bulkValues.findIndex((bv) => bv.property === TicketProperty.STATE_ID);
                    this.bulkValues.splice(index + 1, 0, value);
                }
            } else {
                await this.deleteValue(TicketProperty.PENDING_TIME);
            }
        } else {
            await this.deleteValue(TicketProperty.PENDING_TIME);
        }
    }

    private async deleteValue(property: string): Promise<void> {
        const value = this.bulkValues.find((bv) => bv.property === property);
        if (value) {
            await this.removeValue(value);
        }
    }

}
