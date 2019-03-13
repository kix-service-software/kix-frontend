import { KIXCommunicator } from './KIXCommunicator';
import {
    SaveWidgetRequest, ContextEvent, LoadContextConfigurationRequest, LoadContextConfigurationResponse,
    ContextConfiguration, SaveContextConfigurationRequest, Error
} from '../core/model';

import { CommunicatorResponse } from '../core/common';
import { ConfigurationService, UserService, LoggingService } from '../core/services';
import { PluginService } from '../services';

export class ContextCommunicator extends KIXCommunicator {

    private static INSTANCE: ContextCommunicator;

    public static getInstance(): ContextCommunicator {
        if (!ContextCommunicator.INSTANCE) {
            ContextCommunicator.INSTANCE = new ContextCommunicator();
        }
        return ContextCommunicator.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'context';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(
            client, ContextEvent.LOAD_CONTEXT_CONFIGURATION, this.loadContextConfiguration.bind(this)
        );
        this.registerEventHandler(
            client, ContextEvent.SAVE_CONTEXT_CONFIGURATION, this.saveContextConfiguration.bind(this)
        );
        this.registerEventHandler(
            client, ContextEvent.SAVE_WIDGET_CONFIGURATION, this.saveWidgetConfiguration.bind(this)
        );
    }

    protected async loadContextConfiguration(
        data: LoadContextConfigurationRequest
    ): Promise<CommunicatorResponse<LoadContextConfigurationResponse<any>>> {
        const user = await UserService.getInstance().getUserByToken(data.token);
        const userId = user.UserID;

        let configuration = await ConfigurationService.getInstance().getModuleConfiguration(data.contextId, userId);

        let response;
        if (!configuration) {
            const configurationExtension = await PluginService.getInstance().getConfigurationExtension(data.contextId);
            const moduleDefaultConfiguration = configurationExtension
                ? await configurationExtension.getDefaultConfiguration() : null;
            if (moduleDefaultConfiguration) {
                ConfigurationService.getInstance().saveModuleConfiguration(
                    data.contextId, userId, moduleDefaultConfiguration);

                configuration = moduleDefaultConfiguration;
                configuration.contextId = data.contextId;

                response = new CommunicatorResponse(
                    ContextEvent.CONTEXT_CONFIGURATION_LOADED,
                    new LoadContextConfigurationResponse(configuration)
                );
            } else {
                const errorMessage = `Translatable#No default configuration for context ${data.contextId} given!`;
                LoggingService.getInstance().error(errorMessage);
                response = new CommunicatorResponse(
                    ContextEvent.CONTEXT_CONFIGURATION_LOADED, errorMessage
                );
            }
        } else {
            configuration.contextId = data.contextId;

            response = new CommunicatorResponse(
                ContextEvent.CONTEXT_CONFIGURATION_LOADED,
                new LoadContextConfigurationResponse(configuration)
            );
        }

        return response;
    }

    private async saveContextConfiguration(data: SaveContextConfigurationRequest): Promise<CommunicatorResponse<void>> {
        const user = await UserService.getInstance().getUserByToken(data.token);
        const userId = user && user.UserID;

        ConfigurationService.getInstance()
            .saveModuleConfiguration(data.contextId, userId, data.configuration);

        return new CommunicatorResponse(ContextEvent.CONTEXT_CONFIGURATION_SAVED);
    }

    private async saveWidgetConfiguration(data: SaveWidgetRequest): Promise<CommunicatorResponse<void>> {
        const user = await UserService.getInstance().getUserByToken(data.token);
        const userId = user && user.UserID;

        const moduleConfiguration = await ConfigurationService.getInstance().getModuleConfiguration(
            data.contextId,
            userId
        );

        if (moduleConfiguration) {
            let index = moduleConfiguration.contentConfiguredWidgets.findIndex(
                (cw) => cw.instanceId === data.instanceId
            );
            if (index > -1) {
                moduleConfiguration.contentConfiguredWidgets[index].configuration = data.widgetConfiguration;
            } else {
                index = moduleConfiguration.sidebarConfiguredWidgets.findIndex(
                    (cw) => cw.instanceId === data.instanceId
                );
                moduleConfiguration.sidebarConfiguredWidgets[index].configuration = data.widgetConfiguration;
            }

            ConfigurationService.getInstance().saveModuleConfiguration(
                data.contextId, userId, moduleConfiguration
            );
            return new CommunicatorResponse(ContextEvent.WIDGET_CONFIGURATION_SAVED);
        }

        return null;
    }
}
