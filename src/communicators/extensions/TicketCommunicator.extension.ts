import { ICommunicatorExtension } from '@kix/core';

import { TicketCommunicator } from '../TicketCommunicator';

export class TicketCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return TicketCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new TicketCommunicatorExtension();
};
