import { UsersCommunicator } from './UsersCommunicator';
import { ICommunicatorExtension } from './../extensions/';

export class UsersCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return UsersCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new UsersCommunicatorExtension();
};
