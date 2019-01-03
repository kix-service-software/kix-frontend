import { KIXCommunicator } from './KIXCommunicator';
import {
    ConfigurationEvent, LoadConfigurationRequest, LoadConfigurationResult, SaveConfigurationRequest
} from '../core/model';
import { CommunicatorResponse } from '../core/common';
import { ConfigurationService, UserService } from '../core/services';
import { PluginService } from '../services';

export class ConfigurationCommunicatior extends KIXCommunicator {

    private static INSTANCE: ConfigurationCommunicatior;

    public static getInstance(): ConfigurationCommunicatior {
        if (!ConfigurationCommunicatior.INSTANCE) {
            ConfigurationCommunicatior.INSTANCE = new ConfigurationCommunicatior();
        }
        return ConfigurationCommunicatior.INSTANCE;
    }

    private constructor() {
        super();
    }

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
            const user = await UserService.getInstance().getUserByToken(data.token);
            userId = user.UserID;
        }

        let configuration = await ConfigurationService.getInstance()
            .getComponentConfiguration(data.contextId, data.componentId, userId);

        if (!configuration) {
            const moduleFactory = await PluginService.getInstance().getConfigurationExtension(data.contextId);
            const moduleDefaultConfiguration = await moduleFactory.getDefaultConfiguration();

            await ConfigurationService.getInstance().saveComponentConfiguration(
                data.contextId, data.componentId, userId, moduleDefaultConfiguration);

            configuration = moduleDefaultConfiguration;
        }

        return this.emitConfigurationLoadedEvent(configuration);
    }

    private async loadSidebarConfiguration(data: LoadConfigurationRequest): Promise<CommunicatorResponse<void>> {
        const user = await UserService.getInstance().getUserByToken(data.token);

        let configuration = await ConfigurationService.getInstance()
            .getComponentConfiguration(data.contextId, data.componentId, user.UserID);

        if (!configuration) {
            const configurationExtension = await PluginService.getInstance().getConfigurationExtension(
                data.componentId
            );
            const sidebarDefaultConfiguration = await configurationExtension.getDefaultConfiguration();

            ConfigurationService.getInstance().saveComponentConfiguration(
                data.contextId, data.componentId, user.UserID, sidebarDefaultConfiguration);

            configuration = sidebarDefaultConfiguration;
        }

        return this.emitConfigurationLoadedEvent(configuration);
    }

    private async saveComponentConfiguration(data: SaveConfigurationRequest): Promise<CommunicatorResponse<void>> {
        let userId = null;
        if (data.userSpecific) {
            const user = await UserService.getInstance().getUserByToken(data.token);
            userId = user && user.UserID;
        }

        await ConfigurationService.getInstance()
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
