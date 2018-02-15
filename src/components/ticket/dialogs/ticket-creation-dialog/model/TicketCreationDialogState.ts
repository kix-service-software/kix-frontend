import { TicketProperty } from "@kix/core/dist/model/ticket/TicketProperty";
import { ComponentId } from "./ComponentId";

export class TicketCreationDialogState {

    public error: any = null;

    public ticketCreationInProcess: boolean = false;

    public resetTicketCreationInProcess: boolean = false;

    public ticketCreated: boolean = false;

    public ticketId: number = null;

    public createNewObjectAfterFinish: boolean = false;

    public loadData: boolean = false;

    public ticketProperties: string[] = [
        TicketProperty.QUEUE_ID,
        TicketProperty.PRIORITY_ID,
        TicketProperty.STATE_ID,
        TicketProperty.SERVICE_ID,
        TicketProperty.SLA_ID,
        TicketProperty.OWNER_ID,
        TicketProperty.RESPONSIBLE_ID,
        TicketProperty.PENDING_TIME,
        TicketProperty.SUBJECT,
        "Description"
    ];
}
