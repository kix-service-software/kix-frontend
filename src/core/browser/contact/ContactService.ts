import {
    ContactProperty, KIXObjectType, ContextMode, Contact, CustomerProperty, TreeNode, KIXObject
} from "../../model";
import { ContactDetailsContext } from ".";
import { ContextService } from "../context";
import { KIXObjectService } from "../kix";

export class ContactService extends KIXObjectService<Contact> {

    private static INSTANCE: ContactService = null;

    public static getInstance(): ContactService {
        if (!ContactService.INSTANCE) {
            ContactService.INSTANCE = new ContactService();
        }

        return ContactService.INSTANCE;
    }

    private constructor() {
        super();

    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONTACT;
    }

    public getLinkObjectName(): string {
        return "Person";
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (value) {
            if (property === ContactProperty.USER_CUSTOMER_ID) {
                if (typeof value === 'object') {
                    value = value[CustomerProperty.CUSTOMER_ID];
                }
                parameter.push([ContactProperty.USER_CUSTOMER_IDS, [value]]);
            }
            parameter.push([property, value]);
        }

        return parameter;
    }

    public openContact(contactId: string, newTab: boolean = false): void {
        if (newTab) {
            const link = document.createElement("a");
            link.href = '/contacts/' + contactId;
            link.target = '_blank';
            const linkClickEvent = new MouseEvent('click', {
                view: window,
                bubbles: false,
                cancelable: true
            });
            link.dispatchEvent(linkClickEvent);
        } else {
            ContextService.getInstance().setContext(null, KIXObjectType.CONTACT, ContextMode.DETAILS, contactId);
        }
    }

    public determineDependendObjects(contacts: Contact[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.CUSTOMER) {
            contacts.forEach((contact) => {
                contact.UserCustomerIDs.forEach((customerId) => {
                    if (!ids.some((id) => id === customerId)) {
                        ids.push(customerId);
                    }
                });
            });
        } else if (targetObjectType === KIXObjectType.TICKET) {
            contacts.forEach((contact) => {
                const ticketIds = contact.Tickets.map(
                    (t) => (typeof t === 'number' || typeof t === 'string') ? t : t.TicketID
                );

                if (ticketIds.length) {
                    ids = [...ids, ...ticketIds];
                }
            });
        }

        return ids;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case ContactProperty.VALID_ID:
                    values = objectData.validObjects.map((vo) => new TreeNode(Number(vo.ID), vo.Name));
                    break;
                default:
            }
        }

        return values;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = await ContextService.getInstance().getContext(ContactDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }
}
