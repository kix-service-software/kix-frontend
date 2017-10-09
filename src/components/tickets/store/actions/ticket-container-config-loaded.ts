import { StateAction, ContainerConfiguration } from '@kix/core/dist/model/client';
import { TicketAction } from './';

export default (containerConfiguration: ContainerConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ containerConfiguration });
    });

    return new StateAction(TicketAction.TICKET_CONTAINER_CONFIGURATION_LOADED, payload);
};
