import { CreationDialogCommunicator } from '../CreationDialogCommunicator';
import { ICommunicatorExtension } from '@kix/core';

export class CreationDialogCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return CreationDialogCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new CreationDialogCommunicatorExtension();
};
