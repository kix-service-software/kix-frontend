import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, TicketType } from "../../../model";

export class TicketPriorityFormService extends KIXObjectFormService<TicketType> {

    private static INSTANCE: TicketPriorityFormService = null;

    public static getInstance(): TicketPriorityFormService {
        if (!TicketPriorityFormService.INSTANCE) {
            TicketPriorityFormService.INSTANCE = new TicketPriorityFormService();
        }

        return TicketPriorityFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_PRIORITY;
    }
}
