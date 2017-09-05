import { ConfigurationCommunicatior } from './ConfigurationCommunicator';
import { ICommunicatorExtension } from './../extensions/';

export class ConfigurationCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return ConfigurationCommunicatior;
    }

}

module.exports = (data, host, options) => {
    return new ConfigurationCommunicatorExtension();
};
