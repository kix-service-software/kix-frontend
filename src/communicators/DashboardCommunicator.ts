import { KIXCommunicator } from './KIXCommunicator';
import {
    DashboardEvent,
    LoadDashboardRequest,
    LoadDashboardResponse,
    SaveDashboardRequest,
    SaveWidgetRequest
} from '@kix/core/dist/model/client/dashboard/socket';

import {
    ContainerConfiguration,
    SocketEvent,
    User,
    WidgetTemplate
} from '@kix/core';
import { WidgetConfiguration } from '@kix/core/dist/model/client/components/widget/WidgetConfiguration';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions/ui/IWidgetFactoryExtension';
import { DashboardAction } from '@kix/core/dist/model/client/dashboard/store/actions/DashboardAction';
import { IWidget } from '@kix/core/dist/model/client/components/widget/IWidget';
import { SidebarConfiguration } from '@kix/core/dist/model/client/components/sidebar/SidebarConfiguration';

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

        let configuration: ContainerConfiguration = await this.configurationService
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

        let widgets: IWidget[] = [];
        for (const row of configuration.rows) {
            widgets = [...widgets, ...row.widgets];
        }

        // Sidebarkonfigurationene laden
        const sidebarConfiguration: SidebarConfiguration =
            await this.configurationService.getComponentConfiguration(data.contextId, 'sidebar', null, userId);

        widgets = [...widgets, ...sidebarConfiguration.widgets];

        for (const widget of widgets) {
            const widgetFactory = await this.pluginService.getWidgetFactory(widget.id);
            widgetTemplates.push(new WidgetTemplate(widget.id, widgetFactory.getTemplate()));

            const widgetConfiguration =
                await this.getWidgetConfiguration(
                    data.contextId, widget.id, widget.instanceId, userId, widgetFactory
                );

            widgetConfigurations.push([widget.instanceId, widgetConfiguration]);
        }

        const response = new LoadDashboardResponse(configuration, widgetTemplates, widgetConfigurations);
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
