import { KIXCommunicator } from './KIXCommunicator';
import {
    ConfigurationEvent,
    LoadConfigurationRequest,
    LoadConfigurationResult,
    SaveConfigurationRequest,
    SocketEvent,
    User
} from '@kix/core/dist/model';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class ConfigurationCommunicatior extends KIXCommunicator {

    protected getNamespace(): string {
        return 'configuration';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, ConfigurationEvent.LOAD_MODULE_CONFIGURATION,
            this.loadModuleConfiguration.bind(this));
        this.registerEventHandler(client, ConfigurationEvent.LOAD_SIDEBAR_CONFIGURATION,
            this.loadSidebarConfiguration.bind(this));
        this.registerEventHandler(client, ConfigurationEvent.SAVE_COMPONENT_CONFIGURATION,
            this.saveComponentConfiguration.bind(this));
    }

    private async loadModuleConfiguration(data: LoadConfigurationRequest): Promise<CommunicatorResponse<void>> {
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

        return this.emitConfigurationLoadedEvent(configuration);
    }

    private async loadSidebarConfiguration(data: LoadConfigurationRequest): Promise<CommunicatorResponse<void>> {
        const user = await this.userService.getUserByToken(data.token);

        let configuration = await this.configurationService
            .getComponentConfiguration(data.contextId, data.componentId, user.UserID);

        if (!configuration) {
            const moduleFactory = await this.pluginService.getModuleFactory(data.componentId);
            const sidebarDefaultConfiguration = moduleFactory.getDefaultConfiguration();

            this.configurationService.saveComponentConfiguration(
                data.contextId, data.componentId, user.UserID, sidebarDefaultConfiguration);

            configuration = sidebarDefaultConfiguration;
        }

        return this.emitConfigurationLoadedEvent(configuration);
    }

    private async saveComponentConfiguration(data: SaveConfigurationRequest): Promise<CommunicatorResponse<void>> {
        let userId = null;
        if (data.userSpecific) {
            const user = await this.userService.getUserByToken(data.token);
            userId = user && user.UserID;
        }

        await this.configurationService
            .saveComponentConfiguration(data.contextId, data.componentId,
                userId, data.configuration
            );

        return new CommunicatorResponse(ConfigurationEvent.COMPONENT_CONFIGURATION_SAVED);
    }

    private emitConfigurationLoadedEvent(configuration: any): CommunicatorResponse<any> {
        const response = new LoadConfigurationResult(configuration);
        return new CommunicatorResponse(ConfigurationEvent.COMPONENT_CONFIGURATION_LOADED, response);
    }
}
