import { IKIXObjectCacheHandler } from "../../IKIXObjectCacheHandler";
import { ServiceMethod } from "../../../browser";
import { KIXObjectType } from "../KIXObjectType";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { KIXObjectCache } from "../../KIXObjectCache";
import { Customer } from "./Customer";

export class CustomerCacheHandler implements IKIXObjectCacheHandler {
    public updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        if (objectType === KIXObjectType.CUSTOMER) {
            switch (method) {
                case ServiceMethod.CREATE:
                    break;
                case ServiceMethod.UPDATE:
                    this.updateCacheForUpdate(objectId, parameter);
                    break;
                default:
            }
        }
    }

    private updateCacheForUpdate(objectId: string | number, parameter?: Array<[string, any]>): void {
        const customer = KIXObjectCache.getObject<Customer>(KIXObjectType.CUSTOMER, objectId);
        KIXObjectCache.removeObject(KIXObjectType.CUSTOMER, objectId);

        if (customer.Tickets) {
            customer.Tickets.forEach((t) => KIXObjectCache.removeObject(KIXObjectType.TICKET, Number(t)));
        }

        if (customer.Contacts) {
            customer.Contacts.forEach((c) => KIXObjectCache.removeObject(KIXObjectType.CONTACT, Number(c)));
        }

    }

    private getParameter(parameter: Array<[string, any]>, property: string): any {
        return parameter.find((p) => p[0] === property);
    }

}
