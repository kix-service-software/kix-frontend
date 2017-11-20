import { WidgetCommunicator } from '../WidgetCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class WidgetCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return WidgetCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new WidgetCommunicatorExtension();
};
