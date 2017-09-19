import { ConfigurationCommunicatior } from './ConfigurationCommunicator';
import { ICommunicatorExtension } from '@kix/core';

export class ConfigurationCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return ConfigurationCommunicatior;
    }

}

module.exports = (data, host, options) => {
    return new ConfigurationCommunicatorExtension();
};
