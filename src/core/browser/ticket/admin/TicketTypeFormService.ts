import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, TicketType } from "../../../model";

export class TicketTypeFormService extends KIXObjectFormService<TicketType> {

    private static INSTANCE: TicketTypeFormService = null;

    public static getInstance(): TicketTypeFormService {
        if (!TicketTypeFormService.INSTANCE) {
            TicketTypeFormService.INSTANCE = new TicketTypeFormService();
        }

        return TicketTypeFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_TYPE;
    }
}
