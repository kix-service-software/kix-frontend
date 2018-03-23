import { KIXCommunicator } from './KIXCommunicator';
import {
    IWidget,
    ConfiguredWidget,
    DashboardEvent,
    DashboardConfiguration,
    LoadDashboardRequest,
    LoadDashboardResponse,
    SaveDashboardRequest,
    SaveWidgetRequest,
    SocketEvent,
    User,
    WidgetConfiguration,
    WidgetTemplate
} from '@kix/core/dist/model';

import { IWidgetFactoryExtension } from '@kix/core/dist/extensions/';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class DashboardCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'dashboard';
    }

    protected registerEvents(): void {
        this.registerEventHandler(DashboardEvent.LOAD_DASHBOARD, this.loadDashboard.bind(this));
        this.registerEventHandler(DashboardEvent.SAVE_DASHBOARD, this.saveDashboard.bind(this));
        this.registerEventHandler(DashboardEvent.SAVE_WIDGET_CONFIGURATION, this.saveWidgetConfiguration.bind(this));
    }

    protected async loadDashboard(data: LoadDashboardRequest): Promise<CommunicatorResponse<LoadDashboardResponse>> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user.UserID;

        let configuration: DashboardConfiguration = await this.configurationService
            .getModuleConfiguration(data.contextId, userId);

        if (!configuration) {
            const moduleFactory = await this.pluginService.getModuleFactory(data.contextId);
            const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();
            this.configurationService.saveModuleConfiguration(
                data.contextId, userId, moduleDefaultConfiguration);

            configuration = moduleDefaultConfiguration;
        }

        const availableWidgets = await this.widgetRepositoryService.getAvailableWidgets(data.contextId);

        configuration.contextId = data.contextId;
        configuration.availableWidgets = availableWidgets;

        const response = new LoadDashboardResponse(configuration);
        return new CommunicatorResponse(DashboardEvent.DASHBOARD_LOADED, response);
    }

    private async saveDashboard(data: SaveDashboardRequest): Promise<CommunicatorResponse<void>> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user && user.UserID;

        this.configurationService
            .saveModuleConfiguration(data.contextId, userId, data.configuration);

        return new CommunicatorResponse(DashboardEvent.DASHBOARD_SAVED);
    }

    private async saveWidgetConfiguration(data: SaveWidgetRequest): Promise<CommunicatorResponse<void>> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user && user.UserID;

        const moduleConfiguration: DashboardConfiguration = await this.configurationService.getModuleConfiguration(
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
            return new CommunicatorResponse(DashboardEvent.WIDGET_CONFIGURATION_SAVED);
        }

        return null;
    }
}
