import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (name: string, value: string) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ name, value });
    });

    return new StateAction(TicketCreationDialogAction.DYNAMIC_FIELD_CHANGED, payload);
};
