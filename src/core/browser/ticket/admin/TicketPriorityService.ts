import { KIXObjectService } from "../../kix";
import {
    TicketPriority, KIXObjectType, KIXObject, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions, KIXObjectCache
} from "../../../model";

export class TicketPriorityService extends KIXObjectService<TicketPriority> {

    private static INSTANCE: TicketPriorityService = null;

    public static getInstance(): TicketPriorityService {
        if (!TicketPriorityService.INSTANCE) {
            TicketPriorityService.INSTANCE = new TicketPriorityService();
        }

        return TicketPriorityService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_PRIORITY;
    }

    public getLinkObjectName(): string {
        return 'TicketPriority';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (objectType === KIXObjectType.TICKET_PRIORITY) {
            if (!KIXObjectCache.hasObjectCache(objectType)) {
                const objects = await super.loadObjects(objectType, null, null, null, false);
                objects.forEach((s) => KIXObjectCache.addObject(objectType, s));
            }

            if (!objectIds) {
                return KIXObjectCache.getObjectCache(objectType);
            }
        }

        return await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions, cache);
    }
}
