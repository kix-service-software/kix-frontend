import {
    Customer, KIXObjectType, CustomerProperty, ContextMode, TreeNode, KIXObject
} from "../../model";
import { CustomerDetailsContext, } from ".";
import { ContextService } from "../context";
import { KIXObjectService } from "../kix";
import { ObjectDataService } from "../ObjectDataService";

export class CustomerService extends KIXObjectService<Customer> {

    private static INSTANCE: CustomerService = null;

    public static getInstance(): CustomerService {
        if (!CustomerService.INSTANCE) {
            CustomerService.INSTANCE = new CustomerService();
        }

        return CustomerService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CUSTOMER;
    }

    public getLinkObjectName(): string {
        return "Person";
    }

    public openCustomer(customerId: string, newTab: boolean = false): void {
        if (newTab) {
            const link = document.createElement("a");
            link.href = '/customers/' + customerId;
            link.target = '_blank';
            const linkClickEvent = new MouseEvent('click', {
                view: window,
                bubbles: false,
                cancelable: true
            });
            link.dispatchEvent(linkClickEvent);
        } else {
            ContextService.getInstance().setContext(null, KIXObjectType.CUSTOMER, ContextMode.DETAILS, customerId);
        }
    }

    public determineDependendObjects(customers: Customer[], targetObjectType: KIXObjectType): string[] | number[] {
        const ids = [];

        if (targetObjectType === KIXObjectType.CONTACT) {
            customers.forEach((c) => {
                if (c.Contacts) {
                    c.Contacts.forEach((co) => {
                        if (typeof co === 'string') {
                            if (!ids.some((id) => id === co)) {
                                ids.push(co);
                            }
                        } else {
                            if (!ids.some((id) => id === co.ContactID)) {
                                ids.push(co.ContactID);
                            }
                        }
                    });
                }
            });
        } else if (targetObjectType === KIXObjectType.TICKET) {
            customers.forEach((c) => {
                if (c.Tickets) {
                    c.Tickets.forEach((t) => {
                        if (typeof t === 'number' || typeof t === 'string') {
                            if (!ids.some((id) => id === t)) {
                                ids.push(t);
                            }
                        } else {
                            if (!ids.some((id) => id === t.TicketID)) {
                                ids.push(t.TicketID);
                            }
                        }
                    });
                }
            });
        }

        return ids;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case CustomerProperty.VALID_ID:
                    values = objectData.validObjects.map((vo) => new TreeNode(Number(vo.ID), vo.Name));
                    break;
                default:
            }
        }

        return values;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = await ContextService.getInstance().getContext(CustomerDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

}
