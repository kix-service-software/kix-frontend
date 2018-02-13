import { Ticket } from "@kix/core/dist/model";

export class TicketPropertyLabelComponentState {

    public constructor(
        public hasLabel: boolean = true,
        public hasText: boolean = true,
        public hasIcon: boolean = true,
        public ticket: Ticket = null,
        public ticketId: number = null,
        public property: string = null,
        public value: any = null
    ) { }
}
