import { Ticket, TicketProperty } from "@kix/core/dist/model";
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";

export class TicketSearchState {

    public constructor(
        public title: string = "Ticketsuche",
        public searching: boolean = false,
        public tickets: Ticket[] = [],
        public time: number = 0,
        public limit: number = 100,
        public ticketProperties: Array<[string, string]> = [],
        public properties: string[] = [],
        public searchAttributes:
            Array<[string, TicketProperty, SearchOperator, string | number | string[] | number[]]> = [],
        public canSearch: boolean = true,
        public error: any = null
    ) { }

}
