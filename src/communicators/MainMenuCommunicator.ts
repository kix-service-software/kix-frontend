import {
    SocketEvent,
    MenuEntry,
    IMainMenuExtension,
    KIXExtensions,
    MainMenuEntriesResult,
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
        client.on(MainMenuEvent.LOAD_MENU_ENTRIES, async () => {

            const menuExtensions = await this.pluginService.getExtensions<IMainMenuExtension>(KIXExtensions.MAIN_MENU);
            const mainMenuEntries = menuExtensions.map((me) => new MenuEntry(me.getLink(), me.getIcon(), me.getText()));

            client.emit(MainMenuEvent.MENU_ENTRIES_LOADED, new MainMenuEntriesResult(mainMenuEntries));
        });
    }

}
