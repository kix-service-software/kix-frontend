import { KIXCommunicator } from './KIXCommunicator';
import {
    ContainerConfiguration,
    DashboardEvent,
    LoadDashboardRequest,
    LoadDashboardResponse,
    SaveDashboardRequest,
    SocketEvent,
    User,
    WidgetTemplate
} from '@kix/core';

export class DashboardCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/dashboard');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerLoadComponentConfigurationEvents(client);
                this.registerSaveDashboardConfigurationEvents(client);
            });
    }

    private registerLoadComponentConfigurationEvents(client: SocketIO.Socket): void {
        client.on(DashboardEvent.LOAD_DASHBOARD, async (data: LoadDashboardRequest) => {

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

            for (const row of configuration.rows) {
                for (const widget of row.widgets) {
                    const widgetFactory = await this.pluginService.getWidgetFactory(widget.id);
                    widgetTemplates.push(new WidgetTemplate(widget.id, widgetFactory.getTemplate()));
                }
            }

            client.emit(DashboardEvent.DASHBOARD_LOADED, new LoadDashboardResponse(configuration, widgetTemplates));
        });

    }

    private registerSaveDashboardConfigurationEvents(client: SocketIO.Socket): void {
        client.on(DashboardEvent.SAVE_DASHBOARD, async (data: SaveDashboardRequest) => {

            const user = await this.userService.getUserByToken(data.token);
            const userId = user && user.UserID;

            await this.configurationService
                .saveComponentConfiguration(data.contextId, null, null, userId, data.configuration);

            client.emit(DashboardEvent.DASHBOARD_SAVED);
        });
    }

}
