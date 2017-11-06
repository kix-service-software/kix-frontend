import { StateAction } from '@kix/core/dist/model/client';

import { TicketCreationProcessReduxState } from './../../TicketCreationProcessReduxState';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default (ticketProcessState: TicketCreationProcessReduxState) => {

    const payload = new Promise((resolve, reject) => {
        ticketProcessState.socketListener.loadTicketData();
        resolve();
    });

    return new StateAction(TicketCreationProcessAction.LOAD_TICKET_STATES, payload);
};
