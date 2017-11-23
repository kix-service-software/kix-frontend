import { Ticket, TicketProperty } from "@kix/core/dist/model";
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";

export class TicketSearchState {

    public constructor(
        public title: string = "Ticketsuche",
        public searching: boolean = false,
        public tickets: Ticket[] = [],
        public time: number = 0,
        public limit: number = 100,
        public searchAttributes: Array<[string, TicketProperty, SearchOperator, string[]]> =
            [
                ['attribute-0', TicketProperty.TICKET_NUMBER, SearchOperator.CONTAINS, ['*']]
            ],
        public canSearch: boolean = true
    ) { }

}
