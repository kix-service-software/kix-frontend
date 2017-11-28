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

        for (const widget of [...configuration.configuredWidgets, ...sidebarConfiguration.configuredWidgets]) {
            const widgetFactory = await this.pluginService.getWidgetFactory(widget[1].widgetId);
            widgetTemplates.push(new WidgetTemplate(widget[0], widgetFactory.getTemplate()));
        }

        const availableWidgets = await this.widgetRepositoryService.getAvailableWidgets(data.contextId);

        const response = new LoadDashboardResponse(
            configuration.rows, widgetTemplates, configuration.configuredWidgets, availableWidgets
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

        await this.configurationService.saveComponentConfiguration(
            data.contextId, data.widgetId, data.instanceId, userId, data.widgetConfiguration
        );

        this.client.emit(DashboardEvent.WIDGET_CONFIGURATION_SAVED);
    }

    private async getWidgetConfiguration(
        contextId: string, widgetId: string, instanceId: string, userId: number, widgetFactory: IWidgetFactoryExtension
    ): Promise<WidgetConfiguration> {

        let configuration = await this.configurationService
            .getComponentConfiguration(contextId, widgetId, instanceId, userId);

        if (!configuration) {
            const widgetDefaultConfiguration = widgetFactory.getDefaultConfiguration();

            await this.configurationService.saveComponentConfiguration(
                contextId, widgetId, instanceId, userId, widgetDefaultConfiguration);

            configuration = widgetDefaultConfiguration;
        }

        return configuration;
    }

}
