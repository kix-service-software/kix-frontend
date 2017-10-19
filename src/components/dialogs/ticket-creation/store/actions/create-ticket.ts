import { TicketCreationReduxState } from './../TicketCreationReduxState';
import { TicketCreationSocketListener } from './../../socket/TicketCreationSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationDialogAction } from './TicketCreationDialogAction';

export default (state: TicketCreationReduxState) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener: TicketCreationSocketListener = state.socketListener;
        socketListener.createTicket(
            state.subject, state.customer, state.customerId, state.stateId, state.priorityId, state.queueId,
            state.typeId, state.serviceId, state.slaId, state.ownerId, state.responsibleId, state.pendingTime,
            state.description, state.dynamicFields
        );

        resolve();
    });

    return new StateAction(TicketCreationDialogAction.CREATE_TICKET, payload);
};
