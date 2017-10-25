import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default () => {

    const payload = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });

    return new StateAction(TicketCreationProcessAction.RESET_TICKET_CREATION, payload);
};
