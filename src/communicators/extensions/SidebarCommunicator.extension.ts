import { SidebarCommunicator } from '../SidebarCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class SidebarCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return SidebarCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new SidebarCommunicatorExtension();
};
