import { KIXObjectService } from "../../kix";
import { TicketPriority, KIXObjectType } from "../../../model";

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
}
