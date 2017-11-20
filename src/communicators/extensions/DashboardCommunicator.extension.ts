import { DashboardCommunicator } from '../DashboardCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class DashboardCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return DashboardCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new DashboardCommunicatorExtension();
};
