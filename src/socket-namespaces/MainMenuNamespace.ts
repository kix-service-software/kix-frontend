import {
    MenuEntry, MainMenuEntriesRequest, MainMenuEntriesResponse,
    MainMenuConfiguration, MainMenuEvent, SocketEvent
} from '../core/model';

import { IMainMenuExtension, KIXExtensions } from '../core/extensions';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { SocketNameSpace } from './SocketNameSpace';
import { ConfigurationService, LoggingService } from '../core/services';
import { PluginService, PermissionService } from '../services';
import { UserService } from '../core/services/impl/api/UserService';

export class MainMenuNamespace extends SocketNameSpace {

    private static INSTANCE: MainMenuNamespace;

    public static getInstance(): MainMenuNamespace {
        if (!MainMenuNamespace.INSTANCE) {
            MainMenuNamespace.INSTANCE = new MainMenuNamespace();
        }
        return MainMenuNamespace.INSTANCE;
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

    private async loadMenuEntries(data: MainMenuEntriesRequest): Promise<SocketResponse> {

        const user = await UserService.getInstance().getUserByToken(data.token).catch(() => null);

        const extensions = await PluginService.getInstance().getExtensions<IMainMenuExtension>(
            KIXExtensions.MAIN_MENU
        ).catch(() => []);

        let configuration: MainMenuConfiguration = ConfigurationService.getInstance().getConfiguration('main-menu');

        if (!configuration) {
            configuration = await this.createDefaultConfiguration(extensions, user.UserID)
                .catch(() => null);
        }

        if (configuration) {
            const primaryEntries = await this.getMenuEntries(
                data.token, extensions, configuration.primaryMenuEntryConfigurations
            ).catch(() => []);

            const secondaryEntries = await this.getMenuEntries(
                data.token, extensions, configuration.secondaryMenuEntryConfigurations
            ).catch(() => []);

            const response = new MainMenuEntriesResponse(
                data.requestId, primaryEntries, secondaryEntries, configuration.showText
            );
            return new SocketResponse(MainMenuEvent.MENU_ENTRIES_LOADED, response);
        } else {
            return new SocketResponse(
                SocketEvent.ERROR,
                new SocketErrorResponse(data.requestId, 'No main menu configuration for user available.')
            );
        }
    }

    private async createDefaultConfiguration(
        extensions: IMainMenuExtension[], userId: number
    ): Promise<MainMenuConfiguration> {

        const primaryConfiguration = extensions
            .filter((me) => me.primaryMenu)
            .sort((a, b) => a.orderRang - b.orderRang)
            .map(
                (me) => new MenuEntry(me.icon, me.text, me.mainContextId, me.contextIds)
            );

        const secondaryConfiguration = extensions
            .filter((me) => !me.primaryMenu)
            .sort((a, b) => a.orderRang - b.orderRang)
            .map(
                (me) => new MenuEntry(me.icon, me.text, me.mainContextId, me.contextIds)
            );
        const configuration = new MainMenuConfiguration(primaryConfiguration, secondaryConfiguration);

        await ConfigurationService.getInstance().saveConfiguration('main-menu', configuration)
            .catch(() => null);

        return configuration;
    }

    private async getMenuEntries(
        token: string, extensions: IMainMenuExtension[], entryConfigurations: MenuEntry[]
    ): Promise<MenuEntry[]> {

        const entries: MenuEntry[] = [];

        for (const ec of entryConfigurations) {
            const menu = extensions.find((me) => me.mainContextId === ec.mainContextId);
            if (menu) {
                const allowed = await PermissionService.getInstance().checkPermissions(token, menu.permissions)
                    .catch(() => false);
                if (allowed) {
                    entries.push(new MenuEntry(menu.icon, menu.text, menu.mainContextId, menu.contextIds));
                }
            }
        }

        return entries;
    }

}
