import { KIXCommunicator } from './KIXCommunicator';
import { SocketEvent } from './../model/client/socket/SocketEvent';
import {
    ConfigurationEvent, LoadConfigurationRequest, LoadConfigurationResult
} from './../model/client/socket/configuration';

export class ConfigurationCommunicatior extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/configuration');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerComponentConfigurationEvents(client);
        });
    }

    private registerComponentConfigurationEvents(client: SocketIO.Socket): void {
        client.on(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION, async (data: LoadConfigurationRequest) => {
            const configuration = this.configurationService.getComponentConfiguration(data.configurationName);
            client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED, new LoadConfigurationResult(configuration));
        });
    }

}
