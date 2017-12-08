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

export class DashboardCommunicator extends KIXCommunicator {

    private client: SocketIO.Socket;

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/dashboard');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.client = client;
                this.client.on(DashboardEvent.LOAD_DASHBOARD, this.loadDashboard.bind(this));
                this.client.on(DashboardEvent.SAVE_DASHBOARD, this.saveDashboard.bind(this));
                this.client.on(DashboardEvent.SAVE_WIDGET_CONFIGURATION, this.saveWidgetConfiguration.bind(this));
            });
    }

    private async loadDashboard(data: LoadDashboardRequest): Promise<void> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user.UserID;

        let configuration: any = await this.configurationService
            .getModuleConfiguration(data.contextId, userId);

        if (!configuration.hasOwnProperty('contentRows')) {
            const moduleFactory = await this.pluginService.getModuleFactory(data.contextId);
            const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();
            await this.configurationService.saveModuleConfiguration(
                data.contextId, userId, moduleDefaultConfiguration);

            configuration = moduleDefaultConfiguration;
        }

        const availableWidgets = await this.widgetRepositoryService.getAvailableWidgets(data.contextId);

        const response = new LoadDashboardResponse(
            new DashboardConfiguration(
                data.contextId,
                configuration.contentRows,
                configuration.sidebarRows,
                configuration.contentConfiguredWidgets,
                configuration.sidebarConfiguredWidgets,
                availableWidgets
            )
        );
        this.client.emit(DashboardEvent.DASHBOARD_LOADED, response);
    }

    private async saveDashboard(data: SaveDashboardRequest): Promise<void> {

        const user = await this.userService.getUserByToken(data.token);
        const userId = user && user.UserID;

        await this.configurationService
            .saveModuleConfiguration(data.contextId, userId, data.configuration);

        this.client.emit(DashboardEvent.DASHBOARD_SAVED);
    }

    private async saveWidgetConfiguration(data: SaveWidgetRequest): Promise<void> {
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

            await this.configurationService.saveModuleConfiguration(
                data.contextId, userId, moduleConfiguration
            );
            this.client.emit(DashboardEvent.WIDGET_CONFIGURATION_SAVED);
        }
    }
}
