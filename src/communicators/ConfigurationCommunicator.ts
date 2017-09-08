import { } from './../model/client/socket/configuration/SaveConfigurationRequest';
import { KIXCommunicator } from './KIXCommunicator';
import { SocketEvent } from './../model/client/socket/SocketEvent';
import {
    ConfigurationEvent,
    LoadConfigurationRequest,
    LoadConfigurationResult,
    SaveConfigurationRequest
} from './../model/client/socket/configuration';

export class ConfigurationCommunicatior extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/configuration');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerLoadComponentConfigurationEvents(client);
                this.registerSaveComponentConfigurationEvents(client);
            });
    }

    private registerLoadComponentConfigurationEvents(client: SocketIO.Socket): void {
        client.on(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION, async (data: LoadConfigurationRequest) => {

            let configName = data.configurationName;

            if (data.userSpecific) {
                const user = await this.userService.getUserByToken(data.token);
                const userId = user && user.UserID;
                configName = userId + '_' + configName;
            }
            const configuration =
                this.configurationService.getComponentConfiguration(configName);

            client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED, new LoadConfigurationResult(configuration));
        });
    }

    private registerSaveComponentConfigurationEvents(client: SocketIO.Socket): void {
        client.on(ConfigurationEvent.SAVE_COMPONENT_CONFIGURATION, async (data: SaveConfigurationRequest) => {

            let configName = data.configurationName;

            if (data.userSpecific) {
                const user = await this.userService.getUserByToken(data.token);
                const userId = user && user.UserID;
                configName = userId + '_' + configName;
            }

            await this.configurationService.saveComponentConfiguration(configName, data.configuration);

            client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED);
        });
    }

}
