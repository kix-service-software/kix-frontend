import {
    MenuEntry, MainMenuEntriesRequest, MainMenuEntriesResponse,
    MainMenuConfiguration, MainMenuEvent
} from '../core/model';

import { IMainMenuExtension, KIXExtensions } from '../core/extensions';
import { CommunicatorResponse } from '../core/common';
import { KIXCommunicator } from './KIXCommunicator';
import { ConfigurationService, UserService } from '../core/services';
import { PluginService } from '../services';

export class MainMenuCommunicator extends KIXCommunicator {

    private static INSTANCE: MainMenuCommunicator;

    public static getInstance(): MainMenuCommunicator {
        if (!MainMenuCommunicator.INSTANCE) {
            MainMenuCommunicator.INSTANCE = new MainMenuCommunicator();
        }
        return MainMenuCommunicator.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'main-menu';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, MainMenuEvent.LOAD_MENU_ENTRIES, this.loadMenuEntries.bind(this));
    }

    private async loadMenuEntries(
        data: MainMenuEntriesRequest
    ): Promise<CommunicatorResponse<MainMenuEntriesResponse>> {

        const user = await UserService.getInstance().getUserByToken(data.token);

        const extensions = await PluginService.getInstance().getExtensions<IMainMenuExtension>(KIXExtensions.MAIN_MENU);

        let configuration: MainMenuConfiguration = await ConfigurationService.getInstance().getComponentConfiguration(
            'personal-settings', 'main-menu', user.UserID
        );

        if (!configuration) {
            configuration = await this.createDefaultConfiguration(extensions, user.UserID);
        }

        const primaryEntries =
            this.getMenuEntries(extensions, configuration.primaryMenuEntryConfigurations);

        const secondaryEntries =
            this.getMenuEntries(extensions, configuration.secondaryMenuEntryConfigurations);

        const response = new MainMenuEntriesResponse(primaryEntries, secondaryEntries, configuration.showText);
        return new CommunicatorResponse(MainMenuEvent.MENU_ENTRIES_LOADED, response);
    }

    private async createDefaultConfiguration(
        extensions: IMainMenuExtension[], userId: number
    ): Promise<MainMenuConfiguration> {

        const primaryConfiguration = extensions
            .filter((me) => me.primaryMenu).map(
                (me) => new MenuEntry(me.icon, me.text, me.mainContextId, me.contextIds)
            );

        const secondaryConfiguration = extensions
            .filter((me) => !me.primaryMenu).map(
                (me) => new MenuEntry(me.icon, me.text, me.mainContextId, me.contextIds)
            );
        const configuration = new MainMenuConfiguration(primaryConfiguration, secondaryConfiguration);

        await ConfigurationService.getInstance().saveComponentConfiguration(
            'personal-settings', 'main-menu', userId, configuration);

        return configuration;
    }

    private getMenuEntries(
        extensions: IMainMenuExtension[], entryConfigurations: MenuEntry[]
    ): MenuEntry[] {

        const entries = entryConfigurations.map((ec) => {
            const menu = extensions.find((me) => me.mainContextId === ec.mainContextId);
            return new MenuEntry(menu.icon, menu.text, menu.mainContextId, menu.contextIds);
        });

        return entries;
    }

}
