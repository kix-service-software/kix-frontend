import { KIXCommunicator } from './KIXCommunicator';
import {
    DashboardEvent,
    LoadDashboardRequest,
    LoadDashboardResponse,
    SaveDashboardRequest,
    SaveWidgetRequest,
    SocketEvent,
    User,
    WidgetTemplate,
    WidgetConfiguration,
    IWidget,
    SidebarConfiguration
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
            .getComponentConfiguration(data.contextId, null, null, userId);

        if (!configuration) {
            const moduleFactory = await this.pluginService.getModuleFactory(data.contextId);
            const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();

            await this.configurationService.saveComponentConfiguration(
                data.contextId, null, null, userId, moduleDefaultConfiguration);

            configuration = moduleDefaultConfiguration;
        }

        const widgetTemplates: WidgetTemplate[] = [];
        const widgetConfigurations: Array<[string, WidgetConfiguration]> = [];

        // get sidebar configuration
        const sidebarConfiguration: SidebarConfiguration =
            await this.configurationService.getComponentConfiguration(data.contextId, 'sidebar', null, userId);

        const widgets = [
            ...(configuration ? configuration.configuredWidgets : []),
            ...(sidebarConfiguration ? sidebarConfiguration.configuredWidgets : [])
        ];

        for (const widget of widgets) {
            const widgetFactory = await this.pluginService.getWidgetFactory(widget[1].widgetId);
            widgetTemplates.push(new WidgetTemplate(widget[0], widgetFactory.getTemplate()));
        }

        const availableWidgets = await this.widgetRepositoryService.getAvailableWidgets(data.contextId);

        const response = new LoadDashboardResponse(
            configuration.rows,
            widgetTemplates,
            (configuration ? configuration.configuredWidgets : []),
            // TODO: wenn sidebar config mit im dashboard behandelt wird ggf. dann immer vorhanden
            (sidebarConfiguration ? sidebarConfiguration.configuredWidgets : []),
            availableWidgets
        );
        this.client.emit(DashboardEvent.DASHBOARD_LOADED, response);
    }

    private async saveDashboard(data: SaveDashboardRequest): Promise<void> {

        const user = await this.userService.getUserByToken(data.token);
        const userId = user && user.UserID;

        await this.configurationService
            .saveComponentConfiguration(data.contextId, null, null, userId, data.configuration);

        this.client.emit(DashboardEvent.DASHBOARD_SAVED);
    }

    private async saveWidgetConfiguration(data: SaveWidgetRequest): Promise<void> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user && user.UserID;

        const config = await this.configurationService.getComponentConfiguration(
            data.contextId,
            (data.componentId ? data.componentId : null),
            null,
            userId
        );
        config.configuredWidgets.forEach((wt) => {
            if (wt[0] === data.instanceId) {
                wt[1] = data.widgetConfiguration;
            }
        });

        await this.configurationService.saveComponentConfiguration(
            data.contextId, data.componentId, null, userId, config
        );

        this.client.emit(DashboardEvent.WIDGET_CONFIGURATION_SAVED);
    }

}
