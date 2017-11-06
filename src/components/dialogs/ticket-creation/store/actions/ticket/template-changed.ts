import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (template: string) => {

    const payload = new Promise((resolve, reject) => {
        resolve({ template });
    });

    return new StateAction(TicketCreationDialogAction.TEMPLATE_CHANGED, payload);
};
