import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (typeId: number) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ typeId });
    });

    return new StateAction(TicketCreationDialogAction.TYPE_ID_CHANGED, payload);
};
