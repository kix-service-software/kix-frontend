import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, TicketState } from "../../../model";

export class TicketStateFormService extends KIXObjectFormService<TicketState> {

    private static INSTANCE: TicketStateFormService = null;

    public static getInstance(): TicketStateFormService {
        if (!TicketStateFormService.INSTANCE) {
            TicketStateFormService.INSTANCE = new TicketStateFormService();
        }

        return TicketStateFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_STATE;
    }
}
