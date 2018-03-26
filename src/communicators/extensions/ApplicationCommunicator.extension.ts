import { ApplicationCommunicator } from '../ApplicationCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class ApplicationCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return ApplicationCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new ApplicationCommunicatorExtension();
};
