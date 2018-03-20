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

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'authentication';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(ConfigurationEvent.LOAD_MODULE_CONFIGURATION, this.loadModuleConfiguration.bind(this));
        client.on(ConfigurationEvent.LOAD_SIDEBAR_CONFIGURATION, this.loadSidebarConfiguration.bind(this));
        client.on(ConfigurationEvent.SAVE_COMPONENT_CONFIGURATION, this.saveComponentConfiguration.bind(this));
    }

    private async loadModuleConfiguration(data: LoadConfigurationRequest): Promise<void> {
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

        this.emitConfigurationLoadedEvent(configuration);
    }

    private async loadSidebarConfiguration(data: LoadConfigurationRequest): Promise<void> {
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

        this.emitConfigurationLoadedEvent(configuration);
    }

    private async saveComponentConfiguration(data: SaveConfigurationRequest): Promise<void> {
        let userId = null;
        if (data.userSpecific) {
            const user = await this.userService.getUserByToken(data.token);
            userId = user && user.UserID;
        }

        await this.configurationService
            .saveComponentConfiguration(data.contextId, data.componentId,
                userId, data.configuration
            );

        this.client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED);
    }

    private emitConfigurationLoadedEvent(configuration: any): void {
        this.client.emit(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED, new LoadConfigurationResult(configuration));
    }
}
