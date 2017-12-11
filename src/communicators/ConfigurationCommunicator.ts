import { KIXCommunicator } from './KIXCommunicator';
import {
    ConfigurationEvent,
    LoadConfigurationRequest,
    LoadConfigurationResult,
    SaveConfigurationRequest,
    SocketEvent,
    User
} from '@kix/core/dist/model';

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
        client.on(ConfigurationEvent.LOAD_MODULE_CONFIGURATION, async (data: LoadConfigurationRequest) => {

            let userId = null;
            if (data.userSpecific) {
                const user = await this.userService.getUserByToken(data.token);
                userId = user.UserID;
            }

            let configuration = await this.configurationService
                .getComponentConfiguration(data.contextId, data.componentId, userId);

            if (!configuration) {
                const moduleFactory = await this.pluginService.getModuleFactory(data.contextId);
                const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();

                await this.configurationService.saveComponentConfiguration(
                    data.contextId, data.componentId, userId, moduleDefaultConfiguration);

                configuration = moduleDefaultConfiguration;
            }

            this.emitConfigurationLoadedEvent(client, configuration);
        });

        client.on(ConfigurationEvent.LOAD_SIDEBAR_CONFIGURATION, async (data: LoadConfigurationRequest) => {
            const user = await this.userService.getUserByToken(data.token);

            let configuration = await this.configurationService
                .getComponentConfiguration(data.contextId, data.componentId, user.UserID);

            if (!configuration) {
                const moduleFactory = await this.pluginService.getModuleFactory(data.componentId);
                const sidebarDefaultConfiguration = moduleFactory.getDefaultConfiguration();

                await this.configurationService.saveComponentConfiguration(
                    data.contextId, data.componentId, user.UserID, sidebarDefaultConfiguration);

                configuration = sidebarDefaultConfiguration;
            }

            this.emitConfigurationLoadedEvent(client, configuration);
        });
    }

    private emitConfigurationLoadedEvent(client: SocketIO.Socket, configuration: any): void {
        client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED, new LoadConfigurationResult(configuration));
    }

    private registerSaveComponentConfigurationEvents(client: SocketIO.Socket): void {
        client.on(ConfigurationEvent.SAVE_COMPONENT_CONFIGURATION, async (data: SaveConfigurationRequest) => {

            let userId = null;
            if (data.userSpecific) {
                const user = await this.userService.getUserByToken(data.token);
                userId = user && user.UserID;
            }

            await this.configurationService
                .saveComponentConfiguration(data.contextId, data.componentId,
                userId, data.configuration
                );

            client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED);
        });
    }

}
