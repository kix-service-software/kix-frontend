import { BulkManager } from "../bulk";
import {
    KIXObjectType, InputFieldTypes, TicketProperty, TreeNode, KIXObjectLoadingOptions,
    ObjectIcon, Contact, SortUtil
} from "../../model";
import { ContextService } from "../context";
import { LabelService } from "../LabelService";
import { ObjectDefinitionUtil, KIXObjectService } from "../kix";
import { TicketService } from "./TicketService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { PropertyOperator } from "../PropertyOperator";

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
                case TicketProperty.CUSTOMER_USER_ID:
                case TicketProperty.CUSTOMER_ID:
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
        const objectData = ContextService.getInstance().getObjectData();
        const ticketDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        if (ticketDefinition) {
            switch (property) {
                case TicketProperty.CUSTOMER_USER_ID:
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
                case TicketProperty.CUSTOMER_ID:
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
        const objectData = ContextService.getInstance().getObjectData();
        const ticketDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        if (ticketDefinition) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
            const attributes = ticketDefinition.Attributes.filter((a) =>
                !a.ReadOnly
                && a.Name !== TicketProperty.PENDING_TIME
                && a.Name !== TicketProperty.CUSTOMER_ID
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
            case TicketProperty.CUSTOMER_USER_ID:
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, null, loadingOptions, null, false
                );
                return contacts.map(
                    (c) => new TreeNode(c.ContactID, c.DisplayValue, new ObjectIcon(c.KIXObjectType, c.ContactID))
                );
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
        const contactValue = this.bulkValues.find((bv) => bv.property === TicketProperty.CUSTOMER_USER_ID);
        if (contactValue) {
            contactValue.objectType = KIXObjectType.CONTACT;
            if (contactValue.value) {
                const customerValue = this.bulkValues.find((bv) => bv.property === TicketProperty.CUSTOMER_ID);
                if (!customerValue) {
                    const contacts = await KIXObjectService.loadObjects<Contact>(
                        KIXObjectType.CONTACT, [contactValue.value.toString()]
                    );
                    if (contacts && contacts.length) {
                        const customerId = contacts[0].UserCustomerID;
                        const value = new ObjectPropertyValue(
                            TicketProperty.CUSTOMER_ID, PropertyOperator.CHANGE, customerId,
                            KIXObjectType.CUSTOMER, true, false
                        );
                        const index = this.bulkValues.findIndex(
                            (bv) => bv.property === TicketProperty.CUSTOMER_USER_ID
                        );
                        this.bulkValues.splice(index + 1, 0, value);
                    }
                }
            } else {
                await this.deleteValue(TicketProperty.CUSTOMER_ID);
            }
        } else {
            await this.deleteValue(TicketProperty.CUSTOMER_ID);
        }
    }

    private async checkStateValue(): Promise<void> {
        const stateValue = this.bulkValues.find((bv) => bv.property === TicketProperty.STATE_ID);
        if (stateValue && stateValue.value) {
            const pendingState = await TicketService.getInstance().isPendingState(Number(stateValue.value));
            if (pendingState && !this.hasValueForProperty(TicketProperty.PENDING_TIME)) {
                const value = new ObjectPropertyValue(
                    TicketProperty.PENDING_TIME, PropertyOperator.CHANGE, null, null, true, true
                );
                const index = this.bulkValues.findIndex((bv) => bv.property === TicketProperty.STATE_ID);
                this.bulkValues.splice(index + 1, 0, value);
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
