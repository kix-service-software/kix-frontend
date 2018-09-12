import {
    MenuEntry, MainMenuEntriesRequest, MainMenuEntriesResponse,
    MainMenuConfiguration, MainMenuEvent
} from '@kix/core/dist/model';

import { IMainMenuExtension, KIXExtensions } from '@kix/core/dist/extensions';
import { CommunicatorResponse } from '@kix/core/dist/common';
import { KIXCommunicator } from './KIXCommunicator';

export class MainMenuCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'main-menu';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, MainMenuEvent.LOAD_MENU_ENTRIES, this.loadMenuEntries.bind(this));
    }

    private async loadMenuEntries(
        data: MainMenuEntriesRequest
    ): Promise<CommunicatorResponse<MainMenuEntriesResponse>> {

        const user = await this.userService.getUserByToken(data.token);

        const extensions = await this.pluginService.getExtensions<IMainMenuExtension>(KIXExtensions.MAIN_MENU);

        let configuration: MainMenuConfiguration = await this.configurationService.getComponentConfiguration(
            "personal-settings", "main-menu", user.UserID
        );

        if (!configuration) {
            configuration = await this.createDefaultConfiguration(extensions, user.UserID);
        } else {
            configuration = await this.validateConfiguration(extensions, configuration, user.UserID);
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

        await this.configurationService.saveComponentConfiguration(
            "personal-settings", "main-menu", userId, configuration);

        return configuration;
    }

    /**
     * Als erstes wird geprüft ob es zu jeder {@link MenuEntryConfiguration} eine passende Extension gibt.
     * Wenn nicht wird die {@link MenuEntryConfiguration} herausgefiltert.
     *
     * Im Zweiten Schritt wird geprüft ob es neue Extension gibt, welche noch nicht in der Konfiguration vorhanden sind.
     * Diese werden dann, wie auch bei der DefaultConfiguration in die primäre Liste eingetragen.
     *
     * @param extensions Die Liste der aktuellen Extensions
     * @param configuration Die aktuelle Konfiguration des Menüs
     */
    private async validateConfiguration(
        extensions: IMainMenuExtension[], configuration: MainMenuConfiguration, userId: number
    ): Promise<MainMenuConfiguration> {

        configuration = this.removeInvalidConfigurations(extensions, configuration);
        configuration = this.addMissingConfigurations(extensions, configuration);

        await this.configurationService.saveComponentConfiguration(
            "personal-settings", "main-menu", userId, configuration);

        return configuration;
    }

    private removeInvalidConfigurations(
        extensions: IMainMenuExtension[], configuration: MainMenuConfiguration
    ): MainMenuConfiguration {

        configuration.primaryMenuEntryConfigurations = configuration.primaryMenuEntryConfigurations.filter(
            (pme) => {
                return extensions.findIndex((me) => me.mainContextId === pme.mainContextId) !== -1;
            });

        configuration.secondaryMenuEntryConfigurations = configuration.secondaryMenuEntryConfigurations.filter(
            (sme) => {
                return extensions.findIndex((me) => me.mainContextId === sme.mainContextId) !== -1;
            });

        return configuration;
    }

    private addMissingConfigurations(
        extensions: IMainMenuExtension[], configuration: MainMenuConfiguration
    ): MainMenuConfiguration {

        const newExtensions = this.findNewMenuExtensions(extensions, configuration);

        const newPrimary = newExtensions.filter((e) => e.primaryMenu)
            .map((me) => new MenuEntry(me.icon, me.text, me.mainContextId, me.contextIds));
        configuration.primaryMenuEntryConfigurations = [
            ...configuration.primaryMenuEntryConfigurations,
            ...newPrimary
        ];

        const newSecondary = newExtensions.filter((e) => !e.primaryMenu)
            .map((me) => new MenuEntry(me.icon, me.text, me.mainContextId, me.contextIds));
        configuration.secondaryMenuEntryConfigurations = [
            ...configuration.primaryMenuEntryConfigurations,
            ...newSecondary
        ];

        return configuration;
    }

    private findNewMenuExtensions(
        extensions: IMainMenuExtension[], configuration: MainMenuConfiguration
    ): IMainMenuExtension[] {

        return extensions.filter((me) => {
            const primaryIndex = configuration.primaryMenuEntryConfigurations.findIndex((pme) => {
                return pme.mainContextId === me.mainContextId;
            });

            const secondaryIndex = configuration.secondaryMenuEntryConfigurations.findIndex((pme) => {
                return pme.mainContextId === me.mainContextId;
            });

            return primaryIndex === -1 && secondaryIndex === -1;
        });
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
