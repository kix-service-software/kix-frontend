import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (stateId: number) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ stateId });
    });

    return new StateAction(TicketCreationDialogAction.STATE_ID_CHANGED, payload);
};
