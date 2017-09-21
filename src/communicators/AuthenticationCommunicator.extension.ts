import { AuthenticationCommunicator } from './AuthenticationCommunicator';
import { ICommunicatorExtension } from '@kix/core';

export class AuthenticationCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return AuthenticationCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new AuthenticationCommunicatorExtension();
};
