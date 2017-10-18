import { ActionCommunicator } from '../ActionCommunicator';
import { ICommunicatorExtension } from '@kix/core';

export class ActionCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return ActionCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new ActionCommunicatorExtension();
};
