import { ActionCommunicator } from './ActionCommunicator';
import { ICommunicatorExtension } from './../extensions/';

export class ActionCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return ActionCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new ActionCommunicatorExtension();
};
