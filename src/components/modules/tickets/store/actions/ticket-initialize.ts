import { TicketsSocketListener } from './../../socket/TicketSocketListener';
import { StateAction, SocketEvent } from '@kix/core/dist/model/client';
import { TicketAction } from './';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const ticketSocketListener = new TicketsSocketListener();
        resolve({ ticketSocketListener });
    });
    return new StateAction(TicketAction.TICKET_INITIALIZE, payload);
};
