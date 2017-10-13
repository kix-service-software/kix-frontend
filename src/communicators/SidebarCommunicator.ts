import { KIXCommunicator } from './KIXCommunicator';
import {
    ContainerConfiguration,
    SidebarEvent,
    LoadSidebarRequest,
    LoadSidebarResponse,
    SaveSidebarRequest,
    SidebarConfiguration,
    SocketEvent,
    User,
    WidgetTemplate
} from '@kix/core';

export class SidebarCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/sidebar');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerLoadSidebarConfigurationEvents(client);
                this.registerSaveSidebarConfigurationEvents(client);
            });
    }

    private registerLoadSidebarConfigurationEvents(client: SocketIO.Socket): void {
        client.on(SidebarEvent.LOAD_SIDEBAR, async (data: LoadSidebarRequest) => {

            const user = await this.userService.getUserByToken(data.token);
            const userId = user.UserID;

            let configuration: SidebarConfiguration = await this.configurationService
                .getComponentConfiguration(data.contextId, 'sidebar', null, userId);

            if (!configuration) {
                const moduleFactory = await this.pluginService.getModuleFactory(data.contextId);
                const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();

                await this.configurationService.saveComponentConfiguration(
                    data.contextId, null, null, userId, moduleDefaultConfiguration);

                configuration = moduleDefaultConfiguration;
            }

            const widgetTemplates: WidgetTemplate[] = [];

            for (const widget of configuration.widgets) {
                const widgetFactory = await this.pluginService.getWidgetFactory(widget.id);
                widgetTemplates.push(new WidgetTemplate(widget.id, widgetFactory.getTemplate()));
            }

            const response = new LoadSidebarResponse(configuration, widgetTemplates);
            client.emit(SidebarEvent.SIDEBAR_LOADED, response);
        });

    }

    private registerSaveSidebarConfigurationEvents(client: SocketIO.Socket): void {
        client.on(SidebarEvent.SAVE_SIDEBAR, async (data: SaveSidebarRequest) => {

            const user = await this.userService.getUserByToken(data.token);
            const userId = user && user.UserID;

            await this.configurationService
                .saveComponentConfiguration(data.contextId, null, null, userId, data.configuration);

            client.emit(SidebarEvent.SIDEBAR_SAVED);
        });
    }

}
