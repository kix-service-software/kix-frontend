import { TicketProperty } from "@kix/core/dist/model/ticket/TicketProperty";
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";

export class SearchAttributeState {

    public constructor(
        public attributeId: string = '',
        public properties: Array<[string, string]> = [],
        public operations: Array<[string, string]> = [],
        public attribute: [TicketProperty, SearchOperator, string[]] = [null, SearchOperator.CONTAINS, ['*']],
        public invalid: boolean = false
    ) { }

}
