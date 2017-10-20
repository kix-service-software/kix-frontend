import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (customer: string) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ customer });
    });

    return new StateAction(TicketCreationDialogAction.CUSTOMER_CHANGED, payload);
};
