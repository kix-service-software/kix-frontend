import { TicketCreationProcessReduxState } from '../../TicketCreationProcessReduxState';
import { TicketCreationReduxState } from '../../TicketCreationReduxState';
import { TicketCreationSocketListener } from '../../../socket/TicketCreationSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default (processState: TicketCreationProcessReduxState, ticketState: TicketCreationReduxState) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener: TicketCreationSocketListener = processState.socketListener;
        socketListener.createTicket(
            ticketState.subject, ticketState.customer, ticketState.customerId, ticketState.stateId,
            ticketState.priorityId, ticketState.queueId, ticketState.typeId, ticketState.serviceId,
            ticketState.slaId, ticketState.ownerId, ticketState.responsibleId, ticketState.pendingTime,
            ticketState.description, ticketState.dynamicFields
        );

        resolve();
    });

    return new StateAction(TicketCreationProcessAction.CREATE_TICKET, payload);
};
