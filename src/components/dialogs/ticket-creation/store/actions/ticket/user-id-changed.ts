import { StateAction, UserType } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (userId: number, userType: string) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ userId, userType });
    });

    return new StateAction(TicketCreationDialogAction.USER_ID_CHANGED, payload);
};
