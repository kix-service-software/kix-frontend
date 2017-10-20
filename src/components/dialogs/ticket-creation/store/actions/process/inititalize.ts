import { TicketCreationSocketListener } from '../../../socket/TicketCreationSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new TicketCreationSocketListener();
        resolve({ socketListener });
    });

    return new StateAction(TicketCreationProcessAction.INITIALIZE, payload);
};

