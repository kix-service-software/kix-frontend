import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, TicketState, TicketStateProperty } from "../../../model";
import { KIXObjectService } from "../../kix";

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

    protected async getValue(property: string, value: any, ticketState: TicketState): Promise<any> {
        if (value) {
            switch (property) {
                case TicketStateProperty.TYPE_ID:
                    const stateTypes = await KIXObjectService.loadObjects(KIXObjectType.TICKET_STATE_TYPE, [value]);
                    if (stateTypes && stateTypes.length) {
                        value = stateTypes[0];
                    }
                    break;
                default:
            }
        }
        return value;
    }
}
