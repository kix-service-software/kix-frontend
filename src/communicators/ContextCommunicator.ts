import { KIXCommunicator } from './KIXCommunicator';
import {
    IWidget,
    ConfiguredWidget,
    SaveWidgetRequest,
    SocketEvent,
    User,
    WidgetConfiguration,
    ContextEvent,
    LoadContextConfigurationRequest,
    LoadContextConfigurationResponse,
    ContextConfiguration,
    SaveContextConfigurationRequest
} from '@kix/core/dist/model';

import { CommunicatorResponse } from '@kix/core/dist/common';

export class ContextCommunicator<T extends ContextConfiguration> extends KIXCommunicator {

    protected getNamespace(): string {
        return 'context';
    }

    protected registerEvents(): void {
        this.registerEventHandler(ContextEvent.LOAD_CONTEXT_CONFIGURATION, this.loadContextConfiguration.bind(this));
        this.registerEventHandler(ContextEvent.SAVE_CONTEXT_CONFIGURATION, this.saveContextConfiguration.bind(this));
        this.registerEventHandler(ContextEvent.SAVE_WIDGET_CONFIGURATION, this.saveWidgetConfiguration.bind(this));
    }

    protected async loadContextConfiguration(
        data: LoadContextConfigurationRequest
    ): Promise<CommunicatorResponse<LoadContextConfigurationResponse<T>>> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user.UserID;

        let configuration = await this.configurationService.getModuleConfiguration(data.contextId, userId);

        if (!configuration) {
            const moduleFactory = await this.pluginService.getModuleFactory(data.contextId);
            const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();
            this.configurationService.saveModuleConfiguration(
                data.contextId, userId, moduleDefaultConfiguration);

            configuration = moduleDefaultConfiguration;
        }

        configuration.contextId = data.contextId;

        const response = new LoadContextConfigurationResponse(configuration);
        return new CommunicatorResponse(ContextEvent.CONTEXT_CONFIGURATION_LOADED, response);
    }

    private async saveContextConfiguration(data: SaveContextConfigurationRequest): Promise<CommunicatorResponse<void>> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user && user.UserID;

        this.configurationService
            .saveModuleConfiguration(data.contextId, userId, data.configuration);

        return new CommunicatorResponse(ContextEvent.CONTEXT_CONFIGURATION_SAVED);
    }

    private async saveWidgetConfiguration(data: SaveWidgetRequest): Promise<CommunicatorResponse<void>> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user && user.UserID;

        const moduleConfiguration = await this.configurationService.getModuleConfiguration(
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

            this.configurationService.saveModuleConfiguration(
                data.contextId, userId, moduleConfiguration
            );
            return new CommunicatorResponse(ContextEvent.WIDGET_CONFIGURATION_SAVED);
        }

        return null;
    }
}
