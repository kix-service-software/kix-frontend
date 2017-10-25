import { TicketCreationProcessReduxState } from './../../TicketCreationProcessReduxState';
import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default (ticketProcessSate: TicketCreationProcessReduxState) => {

    const payload = new Promise((resolve, reject) => {
        ticketProcessSate.socketListener.loadTicketData();
        resolve();
    });

    return new StateAction(TicketCreationProcessAction.LOAD_TICKET_STATES, payload);
};
