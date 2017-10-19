import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (description: string) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ description });
    });

    return new StateAction(TicketCreationDialogAction.DESCRIPTION_CHANGED, payload);
};
