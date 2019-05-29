import { KIXObjectService } from "../../kix";
import {
    TicketState, KIXObjectType, KIXObject, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions
} from "../../../model";

export class TicketStateService extends KIXObjectService<TicketState> {

    private static INSTANCE: TicketStateService = null;

    public static getInstance(): TicketStateService {
        if (!TicketStateService.INSTANCE) {
            TicketStateService.INSTANCE = new TicketStateService();
        }

        return TicketStateService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_STATE
            || kixObjectType === KIXObjectType.TICKET_STATE_TYPE;
    }

    public getLinkObjectName(): string {
        return 'TicketState';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.TICKET_STATE) {
            objects = await super.loadObjects<O>(KIXObjectType.TICKET_STATE, null, loadingOptions);
        } else if (objectType === KIXObjectType.TICKET_STATE_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.TICKET_STATE_TYPE, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

}
