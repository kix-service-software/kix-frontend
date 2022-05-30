/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { MainMenuEvent } from '../model/MainMenuEvent';
import { MainMenuEntriesRequest } from '../model/MainMenuEntriesRequest';
import { SocketResponse } from '../../../modules/base-components/webapp/core/SocketResponse';
import { IMainMenuExtension } from '../../../server/extensions/IMainMenuExtension';
import { MainMenuConfiguration } from '../../../model/MainMenuConfiguration';
import { PluginService } from '../../../../../server/services/PluginService';
import { AgentPortalExtensions } from '../../../server/extensions/AgentPortalExtensions';
import { ModuleConfigurationService } from '../../../server/services/configuration/ModuleConfigurationService';
import { MainMenuEntriesResponse } from '../model/MainMenuEntriesResponse';
import { SocketEvent } from '../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../modules/base-components/webapp/core/SocketErrorResponse';
import { MenuEntry } from '../../../model/MenuEntry';
import { PermissionService } from '../../../server/services/PermissionService';

import cookie from 'cookie';
import { Socket } from 'socket.io';

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

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, MainMenuEvent.LOAD_MENU_ENTRIES, this.loadMenuEntries.bind(this));
    }

    private async loadMenuEntries(data: MainMenuEntriesRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const extensions = await PluginService.getInstance().getExtensions<IMainMenuExtension>(
            AgentPortalExtensions.MAIN_MENU
        ).catch(() => []);

        let configuration = await ModuleConfigurationService.getInstance().loadConfiguration<MainMenuConfiguration>(
            token, 'application-main-menu'
        );

        if (!configuration) {
            configuration = await this.createDefaultConfiguration(token, extensions).catch(() => null);
        }

        if (configuration) {
            const primaryEntries = await this.getMenuEntries(
                token, extensions, configuration.primaryMenuEntryConfigurations
            ).catch(() => []);

            const secondaryEntries = await this.getMenuEntries(
                token, extensions, configuration.secondaryMenuEntryConfigurations, false
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
        token: string, extensions: IMainMenuExtension[]
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

        await ModuleConfigurationService.getInstance().saveConfiguration(token, configuration)
            .catch(() => null);

        return configuration;
    }

    private async getMenuEntries(
        token: string, extensions: IMainMenuExtension[], entryConfigurations: MenuEntry[], primary: boolean = true
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

        // add extensions which are not in cofniguration
        for (const extension of extensions) {
            if (!entries.some((e) => e.mainContextId === extension.mainContextId)) {
                const allowed = await PermissionService.getInstance().checkPermissions(token, extension.permissions)
                    .catch(() => false);
                if (allowed && extension.primaryMenu === primary) {
                    entries.push(
                        new MenuEntry(extension.icon, extension.text, extension.mainContextId, extension.contextIds)
                    );
                }
            }
        }

        return entries;
    }

}
