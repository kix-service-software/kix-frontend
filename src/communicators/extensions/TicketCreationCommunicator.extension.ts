import { TicketCreationCommunicator } from '../TicketCreationCommunicator';
import { ICommunicatorExtension } from '@kix/core';

export class TicketCreationCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return TicketCreationCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new TicketCreationCommunicatorExtension();
};
