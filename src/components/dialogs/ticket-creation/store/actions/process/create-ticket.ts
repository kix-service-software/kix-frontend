import { TicketInfoWidget } from './../../../../../../modules/widgets/ticket-info/TicketInfoWidget';
import { TicketCreationProcessReduxState } from '../../TicketCreationProcessReduxState';
import { TicketCreationReduxState } from '../../TicketCreationReduxState';
import { TicketCreationSocketListener } from '../../../socket/TicketCreationSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { TicketCreationProcessAction } from './TicketCreationProcessAction';

export default (processState: TicketCreationProcessReduxState, ticketState: TicketCreationReduxState) => {
    const payload = new Promise(async (resolve, reject) => {
        const socketListener: TicketCreationSocketListener = processState.socketListener;

        const ticketId = await socketListener.createTicket(
            ticketState.subject, ticketState.customer, ticketState.customerId, ticketState.stateId,
            ticketState.priorityId, ticketState.queueId, ticketState.typeId, ticketState.serviceId,
            ticketState.slaId, ticketState.ownerId, ticketState.responsibleId, ticketState.pendingTime,
            ticketState.description, ticketState.dynamicFields
        );

        resolve({ ticketId });
    });

    return new StateAction(TicketCreationProcessAction.CREATE_TICKET, payload);
};
