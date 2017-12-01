import { Ticket, TicketProperty } from "@kix/core/dist/model";
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";

export class TicketSearchState {

    public constructor(
        public searching: boolean = false,
        public limit: number = 100,
        public properties: string[] = [],
        public searchAttributes:
            Array<[string, TicketProperty, SearchOperator, string | number | string[] | number[]]> = [],
        public canSearch: boolean = true,
        public error: any = null,
    ) { }

}
