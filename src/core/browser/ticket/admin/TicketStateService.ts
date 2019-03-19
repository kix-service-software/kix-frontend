import { KIXObjectService } from "../../kix";
import { TicketState, KIXObjectType } from "../../../model";

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

}
