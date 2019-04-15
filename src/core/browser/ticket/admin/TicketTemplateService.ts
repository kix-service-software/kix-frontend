import { KIXObjectService } from "../../kix";
import {
    KIXObjectType, KIXObjectSpecificLoadingOptions, KIXObjectLoadingOptions, KIXObject, TicketTemplate
} from "../../../model";

export class TicketTemplateService extends KIXObjectService<TicketTemplate> {

    private static INSTANCE: TicketTemplateService = null;

    public static getInstance(): TicketTemplateService {
        if (!TicketTemplateService.INSTANCE) {
            TicketTemplateService.INSTANCE = new TicketTemplateService();
        }

        return TicketTemplateService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_TEMPLATE;
    }

    public getLinkObjectName(): string {
        return 'TicketTemplate';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.TICKET_TEMPLATE) {
            objects = await super.loadObjects<O>(KIXObjectType.TICKET_TEMPLATE, null, loadingOptions);
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
