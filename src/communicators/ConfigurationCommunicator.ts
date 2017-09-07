import { KIXCommunicator } from './KIXCommunicator';
import { SocketEvent } from './../model/client/socket/SocketEvent';
import {
    ConfigurationEvent, LoadConfigurationRequest, LoadConfigurationResult
} from './../model/client/socket/configuration';

export class ConfigurationCommunicatior extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/configuration');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerComponentConfigurationEvents(client);
            });
    }

    private registerComponentConfigurationEvents(client: SocketIO.Socket): void {
        client.on(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION, async (data: LoadConfigurationRequest) => {

            let configName = data.configurationName;

            if (data.userSpecific) {
                const user = await this.userService.getUserByToken(data.token);
                const userId = user && user.UserID ? user.UserID : 1;
                configName = userId + '_' + configName;
            }
            const configuration =
                this.configurationService.getComponentConfiguration(configName);

            client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED, new LoadConfigurationResult(configuration));
        });
    }

}
