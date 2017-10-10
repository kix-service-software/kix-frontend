import {
    SocketEvent,
    MenuEntry,
    MainMenuEntriesRequest,
    MainMenuEntriesResponse,
    MenuEntryConfiguration,
    MainMenuConfiguration,
    IMainMenuExtension,
    KIXExtensions,
    MainMenuEvent,
    IServerConfiguration,
    ICommunicator,
    IAuthenticationService,
    ILoggingService,
    IConfigurationService
} from '@kix/core';

import { KIXCommunicator } from './KIXCommunicator';

export class MainMenuCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/main-menu');
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerMainMenuEvents(client);
            });
    }

    private registerMainMenuEvents(client: SocketIO.Socket): void {
        client.on(MainMenuEvent.LOAD_MENU_ENTRIES, async (data: MainMenuEntriesRequest) => {

            const user = await this.userService.getUserByToken(data.token);

            const menuExtensions = await this.pluginService.getExtensions<IMainMenuExtension>(KIXExtensions.MAIN_MENU);

            let configuration: MainMenuConfiguration = await this.configurationService.getComponentConfiguration(
                "personal-settings", "main-menu", null, user.UserID
            );

            if (!configuration) {
                configuration = await this.createDefaultConfiguraton(menuExtensions, user.UserID);
            }

            const primaryEntries =
                this.getMenuEntries(menuExtensions, configuration.primaryMenuEntryConfigurations);

            const secondaryEntries =
                this.getMenuEntries(menuExtensions, configuration.secondaryMenuEntryConfigurations);

            const response = new MainMenuEntriesResponse(primaryEntries, secondaryEntries, configuration.showText);
            client.emit(MainMenuEvent.MENU_ENTRIES_LOADED, response);
        });
    }

    private async createDefaultConfiguraton(
        menuExtensions: IMainMenuExtension[], userId: number
    ): Promise<MainMenuConfiguration> {

        const primaryConfiguration = menuExtensions.map(
            (me) => new MenuEntryConfiguration(me.getContextId(), true)
        );

        const configuration = new MainMenuConfiguration(primaryConfiguration, []);

        await this.configurationService.saveComponentConfiguration(
            "personal-settings", "main-menu", null, userId, configuration);

        return configuration;
    }

    private getMenuEntries(
        menuExtensions: IMainMenuExtension[], entryConfigurations: MenuEntryConfiguration[]
    ): MenuEntry[] {

        const entries = entryConfigurations.filter((ec) => ec.visible).map((ec) => {
            const menuExtension = menuExtensions.find((me) => me.getContextId() === ec.contextId);
            return new MenuEntry(
                menuExtension.getLink(), menuExtension.getIcon(), menuExtension.getText(), menuExtension.getContextId()
            );
        });

        return entries;
    }

}
