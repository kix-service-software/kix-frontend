import { StateAction } from '@kix/core/dist/model/client';
import { TicketState, TicketPriority, TicketType } from '@kix/core';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default (
    ticketTemplates: any[], queues: any[], services: any[], slas: any[],
    ticketPriorities: TicketPriority[], ticketStates: TicketState[], ticketTypes: TicketType[]
) => {
    const payload = new Promise((resolve, reject) => {
        resolve({
            ticketTemplates, queues, services, slas,
            ticketPriorities, ticketStates, ticketTypes
        });
    });

    return new StateAction(TicketCreationProcessAction.TICKET_DATA_LOADED, payload);
};
