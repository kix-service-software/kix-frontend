import { MenuEntry } from './../model-client/menu/MenuEntry';
import { IMainMenuExtension, KIXExtensions } from './../extensions/';
import { MainMenuEntriesResult } from './../model-client/menu/socket/MainMenuEntriesResult';
import { IAuthenticationService, ILoggingService, IConfigurationService } from './../services/';
import { IServerConfiguration } from './../model/';
import { inject, injectable } from 'inversify';
import { ICommunicator } from './ICommunicator';
import { SocketEvent } from "../model-client/index";
import { KIXCommunicator } from './KIXCommunicator';
import { MainMenuEvent } from './../model-client/menu';

export class MainMenuCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/main-menu');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
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
