import { CreateDialogCommunicator } from '../CreateDialogCommunicator';
import { ICommunicatorExtension } from '@kix/core';

export class CreateDialogCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return CreateDialogCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new CreateDialogCommunicatorExtension();
};
