import { KIXCommunicator } from './KIXCommunicator';
import {
    SocketEvent,
    KIXExtensions,
    WidgetEvent,
    LoadWidgetRequest,
    LoadWidgetResponse,
    SaveConfigurationRequest
} from '@kix/core';
export class WidgetCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/widget');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerWidgetEvents(client);
            });
    }

    private registerWidgetEvents(client: SocketIO.Socket): void {
        client.on(WidgetEvent.LOAD_WIDGET, async (data: LoadWidgetRequest) => {
            const user = await this.userService.getUserByToken(data.token);

            const widgetFactory = await this.pluginService.getWidgetFactory(data.componentId, data.type);

            let configuration = await this.configurationService
                .getComponentConfiguration(data.contextId, data.componentId, data.instanceId, user.UserID);

            if (!configuration) {
                const widgetDefaultConfiguration = widgetFactory.getDefaultConfiguration();

                await this.configurationService.saveComponentConfiguration(
                    data.contextId, data.componentId, data.instanceId, user.UserID, widgetDefaultConfiguration);

                configuration = widgetDefaultConfiguration;
            }

            const response = new LoadWidgetResponse(
                widgetFactory.getTemplate(), widgetFactory.getConfigurationTemplate(), configuration
            );
            client.emit(WidgetEvent.WIDGET_LOADED, response);
        });

        client.on(WidgetEvent.SAVE_WIDGET_CONFIGURATION, async (data: SaveConfigurationRequest) => {

            let userId = null;
            if (data.userSpecific) {
                const user = await this.userService.getUserByToken(data.token);
                userId = user && user.UserID;
            }

            await this.configurationService.saveComponentConfiguration(
                data.contextId, data.componentId, data.instanceId, userId, data.configuration
            );

            client.emit(WidgetEvent.WIDGET_CONFIGURATION_SAVED);
        });
    }

}
