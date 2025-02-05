import { TicketContext } from '../webapp/core';

export class TicketRouteConfiguration {

    public constructor(
        public severity: string = 'info',
        public targetContextId: string = TicketContext.CONTEXT_ID
    ) { }
}