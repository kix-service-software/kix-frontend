import { Ticket } from '@kix/core/dist/model';

export class TicketTableComponentState {

    public constructor(
        public tickets: Ticket[] = [],
        public properties: Array<[string, string]> = [],
        public displayLimit: number = 10
    ) { }

}
