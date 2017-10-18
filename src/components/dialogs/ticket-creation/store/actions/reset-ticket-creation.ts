import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default () => {

    const payload = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });

    return new StateAction(TicketCreationDialogAction.RESET_TICKET_CREATION, payload);
};
