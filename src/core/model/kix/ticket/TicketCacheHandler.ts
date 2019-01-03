import { IKIXObjectCacheHandler } from "../../IKIXObjectCacheHandler";
import { KIXObjectType } from "../KIXObjectType";
import { ServiceMethod } from "../../../browser";
import { KIXObjectCache } from "../../KIXObjectCache";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { CreateTicketArticleOptions } from "./CreateTicketArticleOptions";
import { TicketProperty } from "./TicketProperty";

export class TicketCacheHandler implements IKIXObjectCacheHandler {

    public updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        if (objectType === KIXObjectType.TICKET) {
            switch (method) {
                case ServiceMethod.CREATE:
                    const contactParameter = parameter.find((p) => p[0] === TicketProperty.CUSTOMER_USER_ID);
                    if (contactParameter) {
                        KIXObjectCache.removeObject(KIXObjectType.CONTACT, contactParameter[1]);
                    }
                    const customerParameter = parameter.find((p) => p[0] === TicketProperty.CUSTOMER_ID);
                    if (customerParameter) {
                        KIXObjectCache.removeObject(KIXObjectType.CUSTOMER, contactParameter[1]);
                    }
                    KIXObjectCache.clearCache(KIXObjectType.QUEUE_HIERARCHY);
                    break;
                case ServiceMethod.UPDATE:
                    KIXObjectCache.removeObject(KIXObjectType.TICKET, Number(objectId));
                    break;
                default:
            }
        } else if (objectType === KIXObjectType.WATCHER) {
            switch (method) {
                case ServiceMethod.CREATE:
                case ServiceMethod.DELETE:
                    KIXObjectCache.removeObject(KIXObjectType.TICKET, Number(objectId));
                    break;
                default:
            }
        } else if (objectType === KIXObjectType.ARTICLE) {
            switch (method) {
                case ServiceMethod.CREATE:
                    const ticketId = (options && options instanceof CreateTicketArticleOptions)
                        ? (options as CreateTicketArticleOptions).ticketId
                        : null;
                    if (ticketId) {
                        KIXObjectCache.removeObject(KIXObjectType.TICKET, Number(ticketId));
                    }
                    break;
                default:
            }
        }
    }

}
