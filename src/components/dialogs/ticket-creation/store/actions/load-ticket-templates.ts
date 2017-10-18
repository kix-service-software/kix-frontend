import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default () => {

    const payload = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 2500);
    });

    return new StateAction(TicketCreationDialogAction.LOAD_TICKET_TEMPLATES, payload);
};
