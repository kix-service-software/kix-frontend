import { IKIXObjectCacheHandler } from "../../IKIXObjectCacheHandler";
import { ServiceMethod } from "../../../browser";
import { KIXObjectType } from "../KIXObjectType";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { ContactProperty } from "./ContactProperty";
import { KIXObjectCache } from "../../KIXObjectCache";
import { KIXObject } from "../KIXObject";
import { Contact } from "./Contact";

export class ContactCacheHandler implements IKIXObjectCacheHandler {
    public updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        if (objectType === KIXObjectType.CONTACT) {
            switch (method) {
                case ServiceMethod.CREATE:
                    const customerIdParameter = this.getParameter(parameter, ContactProperty.USER_CUSTOMER_ID);
                    if (customerIdParameter) {
                        KIXObjectCache.removeObject(KIXObjectType.CUSTOMER, customerIdParameter[1]);
                    }
                    break;
                case ServiceMethod.UPDATE:
                    this.updateCacheForContactUpdate(objectId, parameter);
                    break;
                default:
            }
        }
    }

    private updateCacheForContactUpdate(objectId: string | number, parameter?: Array<[string, any]>): void {
        const contact = KIXObjectCache.getObject<Contact>(KIXObjectType.CONTACT, objectId);
        KIXObjectCache.removeObject(KIXObjectType.CONTACT, objectId);

        KIXObjectCache.removeObject(KIXObjectType.CUSTOMER, contact.UserCustomerID);

        if (contact.Tickets) {
            contact.Tickets.forEach((t) => KIXObjectCache.removeObject(KIXObjectType.TICKET, Number(t)));
        }

        const customerParameter = this.getParameter(parameter, ContactProperty.USER_CUSTOMER_ID);
        if (customerParameter) {
            KIXObjectCache.removeObject(KIXObjectType.CUSTOMER, customerParameter[1]);
        }
    }

    private getParameter(parameter: Array<[string, any]>, property: string): any {
        return parameter.find((p) => p[0] === property);
    }

}
