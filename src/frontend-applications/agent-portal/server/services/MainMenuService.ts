/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PluginService } from '../../../../server/services/PluginService';
import { MainMenuConfiguration } from '../../model/MainMenuConfiguration';
import { MainMenu } from '../../model/MainMenu';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { IMainMenuExtension } from '../extensions/IMainMenuExtension';
import { ModuleConfigurationService } from './configuration/ModuleConfigurationService';
import { MenuEntry } from '../../model/MenuEntry';
import { PermissionService } from './PermissionService';

export class MainMenuService {

    public static async loadMenuEntries(token: string, clientRequestId: string): Promise<MainMenu> {
        let configuration = await ModuleConfigurationService.getInstance().loadConfiguration<MainMenuConfiguration>(
            token, 'application-main-menu'
        );

        let result: MainMenu;

        if (!configuration) {
            configuration = await this.createDefaultConfiguration(token).catch(() => null);
        }

        if (configuration) {
            const extensions = await PluginService.getInstance().getExtensions<IMainMenuExtension>(
                AgentPortalExtensions.MAIN_MENU
            ).catch(() => []);

            const primaryEntries = await this.getMenuEntries(
                token, extensions, configuration.primaryMenuEntryConfigurations, clientRequestId
            ).catch(() => []);

            const secondaryEntries = await this.getMenuEntries(
                token, extensions, configuration.secondaryMenuEntryConfigurations, clientRequestId, false
            ).catch(() => []);

            result = new MainMenu(primaryEntries, secondaryEntries);
        }

        return result;
    }

    public static async createDefaultConfiguration(token: string): Promise<MainMenuConfiguration> {
        const extensions = await PluginService.getInstance().getExtensions<IMainMenuExtension>(
            AgentPortalExtensions.MAIN_MENU
        ).catch(() => []);

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

    private static async getMenuEntries(
        token: string, extensions: IMainMenuExtension[], entryConfigurations: MenuEntry[],
        clientRequestId: string, primary: boolean = true
    ): Promise<MenuEntry[]> {

        const entries: MenuEntry[] = [];

        for (const ec of entryConfigurations) {
            const menu = extensions.find((me) => me.mainContextId === ec.mainContextId);
            if (menu) {
                const allowed = await PermissionService.getInstance().checkPermissions(
                    token, menu.permissions, clientRequestId
                ).catch(() => false);

                if (allowed) {
                    entries.push(new MenuEntry(menu.icon, menu.text, menu.mainContextId, menu.contextIds));
                }
            }
        }

        // add extensions which are not in cofniguration
        for (const extension of extensions) {
            if (!entries.some((e) => e.mainContextId === extension.mainContextId)) {
                const allowed = await PermissionService.getInstance().checkPermissions(
                    token, extension.permissions, clientRequestId
                ).catch(() => false);
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