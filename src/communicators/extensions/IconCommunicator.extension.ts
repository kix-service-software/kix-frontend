import { IconCommunicator } from '../IconCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class IconCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return IconCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new IconCommunicatorExtension();
};
