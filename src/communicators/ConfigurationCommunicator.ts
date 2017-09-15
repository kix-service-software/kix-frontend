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
        client.on(ConfigurationEvent.LOAD_WIDGET_CONFIGURATION, async (data: LoadConfigurationRequest) => {
            const user = await this.userService.getUserByToken(data.token);

            const configuration = await this.configurationService
                .getComponentConfiguration(data.contextId, data.componentId, user.UserID)
                .catch(async (error) => {
                    const widgetFactory = await this.pluginService.getWidgetFactory(data.componentId);
                    const widgetDefaultConfiguration = widgetFactory.getDefaultConfiguration();

                    await this.configurationService.saveComponentConfiguration(
                        data.contextId, data.componentId, user.UserID, widgetDefaultConfiguration);

                    return widgetDefaultConfiguration;
                });

            this.emitConfigurationLoadedEvent(client, configuration);
        });

        client.on(ConfigurationEvent.LOAD_MODULE_CONFIGURATION, async (data: LoadConfigurationRequest) => {

            let userId = null;
            if (data.userSpecific) {
                const user = await this.userService.getUserByToken(data.token);
                userId = user.UserID;
            }

            const configuration = await this.configurationService
                .getComponentConfiguration(data.contextId, data.componentId, userId)
                .catch(async (error) => {
                    const moduleFactory = await this.pluginService.getModuleFactory(data.contextId);
                    const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();

                    await this.configurationService.saveComponentConfiguration(
                        data.contextId, data.componentId, userId, moduleDefaultConfiguration);

                    return moduleDefaultConfiguration;
                });

            this.emitConfigurationLoadedEvent(client, configuration);
        });

        client.on(ConfigurationEvent.LOAD_KIX_SIDEBAR_CONFIGURATION, async (data: LoadConfigurationRequest) => {
            const user = await this.userService.getUserByToken(data.token);

            const configuration = await this.configurationService
                .getComponentConfiguration(data.contextId, data.componentId, user.UserID)
                .catch(async (error) => {
                    const moduleFactory = await this.pluginService.getModuleFactory(data.componentId);
                    const kixSidebarDefaultConfiguration = moduleFactory.getDefaultConfiguration();

                    await this.configurationService.saveComponentConfiguration(
                        data.contextId, data.componentId, user.UserID, kixSidebarDefaultConfiguration);

                    return kixSidebarDefaultConfiguration;
                });

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
                .saveComponentConfiguration(data.contextId, data.componentId, userId, data.configuration);

            client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED);
        });
    }

}
