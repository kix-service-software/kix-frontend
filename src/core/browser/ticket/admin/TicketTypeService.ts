import { KIXObjectService } from "../../kix";
import { TicketType, KIXObjectType } from "../../../model";

export class TicketTypeService extends KIXObjectService<TicketType> {

    private static INSTANCE: TicketTypeService = null;

    public static getInstance(): TicketTypeService {
        if (!TicketTypeService.INSTANCE) {
            TicketTypeService.INSTANCE = new TicketTypeService();
        }

        return TicketTypeService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_TYPE;
    }

    public getLinkObjectName(): string {
        return 'TicketType';
    }

}
