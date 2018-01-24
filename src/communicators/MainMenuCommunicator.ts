import {
    SocketEvent,
    MenuEntry,
    MainMenuEntriesRequest,
    MainMenuEntriesResponse,
    MenuEntryConfiguration,
    MainMenuConfiguration,
    MainMenuEvent
} from '@kix/core/dist/model';

import { IMainMenuExtension, KIXExtensions } from '@kix/core/dist/extensions';
import { IServerConfiguration, ICommunicator } from '@kix/core/dist/common';
import { IAuthenticationService, ILoggingService, IConfigurationService } from '@kix/core/dist/services';

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

            const extensions = await this.pluginService.getExtensions<IMainMenuExtension>(KIXExtensions.MAIN_MENU);

            let configuration: MainMenuConfiguration = await this.configurationService.getComponentConfiguration(
                "personal-settings", "main-menu", user.UserID
            );

            if (!configuration) {
                configuration = await this.createDefaultConfiguraton(extensions, user.UserID);
            } else {
                configuration = await this.validateConfiguration(extensions, configuration, user.UserID);
            }

            const primaryEntries =
                this.getMenuEntries(extensions, configuration.primaryMenuEntryConfigurations);

            const secondaryEntries =
                this.getMenuEntries(extensions, configuration.secondaryMenuEntryConfigurations);

            const response = new MainMenuEntriesResponse(primaryEntries, secondaryEntries, configuration.showText);
            client.emit(MainMenuEvent.MENU_ENTRIES_LOADED, response);
        });
    }

    private async createDefaultConfiguraton(
        extensions: IMainMenuExtension[], userId: number
    ): Promise<MainMenuConfiguration> {

        const primaryConfiguration = extensions.map(
            (me) => new MenuEntryConfiguration(me.getContextId(), true)
        );

        const configuration = new MainMenuConfiguration(primaryConfiguration, []);

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
                return extensions.findIndex((me) => me.getContextId() === pme.contextId) !== -1;
            });

        configuration.secondaryMenuEntryConfigurations = configuration.secondaryMenuEntryConfigurations.filter(
            (sme) => {
                return extensions.findIndex((me) => me.getContextId() === sme.contextId) !== -1;
            });

        return configuration;
    }

    private addMissingConfigurations(
        extensions: IMainMenuExtension[], configuration: MainMenuConfiguration
    ): MainMenuConfiguration {

        const newExtensions = this.findNewMenuExtensions(extensions, configuration);

        for (const me of newExtensions) {
            configuration.primaryMenuEntryConfigurations.push(new MenuEntryConfiguration(me.getContextId(), true));
        }

        return configuration;
    }

    private findNewMenuExtensions(
        extensions: IMainMenuExtension[], configuration: MainMenuConfiguration
    ): IMainMenuExtension[] {

        return extensions.filter((me) => {
            const primaryIndex = configuration.primaryMenuEntryConfigurations.findIndex((pme) => {
                return pme.contextId === me.getContextId();
            });

            const secondaryIndex = configuration.secondaryMenuEntryConfigurations.findIndex((pme) => {
                return pme.contextId === me.getContextId();
            });

            return primaryIndex === -1 && secondaryIndex === -1;
        });
    }

    private getMenuEntries(
        extensions: IMainMenuExtension[], entryConfigurations: MenuEntryConfiguration[]
    ): MenuEntry[] {

        const entries = entryConfigurations.filter((ec) => ec.visible).map((ec) => {
            const menuExtension = extensions.find((me) => me.getContextId() === ec.contextId);
            return new MenuEntry(
                menuExtension.getLink(), menuExtension.getIcon(), menuExtension.getText(), menuExtension.getContextId()
            );
        });

        return entries;
    }

}
