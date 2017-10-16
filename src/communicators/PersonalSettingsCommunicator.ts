import { KIXCommunicator } from './KIXCommunicator';
import {
    IPersonalSettingsExtension,
    KIXExtensions,
    LoadPersonalSettingsRequest,
    LoadPersonalSettingsResponse,
    PersonalSettingsEvent,
    PersonalSettings,
    SavePersonalSettingsRequest,
    SocketEvent
} from '@kix/core';

const PERSONAL_SETTINGS = "personal-settings";

export class PersonalSettingsCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/' + PERSONAL_SETTINGS);
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerPersonalSettingsEvents(client);
            });
    }

    private registerPersonalSettingsEvents(client: SocketIO.Socket): void {
        client.on(PersonalSettingsEvent.LOAD_PERSONAL_SETTINGS, async (data: LoadPersonalSettingsRequest) => {

            const user = await this.userService.getUserByToken(data.token);
            const userId = user.UserID;

            const personalSettingsExtensions = await this.pluginService
                .getExtensions<IPersonalSettingsExtension<any, any>>(KIXExtensions.PERSONAL_SETTINGS);

            let configuration =
                await this.configurationService.getComponentConfiguration(PERSONAL_SETTINGS, null, null, userId);

            if (!configuration) {
                configuration = {};
            }

            const settings = await this.getPersonalSettings(configuration, personalSettingsExtensions, userId);

            const loadResponse = new LoadPersonalSettingsResponse<any, any>(settings);
            client.emit(PersonalSettingsEvent.PERSONAL_SETTINGS_LOADED, loadResponse);
        });
    }

    private async getPersonalSettings(
        configuration: any,
        personalSettingsExtensions: Array<IPersonalSettingsExtension<any, any>>,
        userId: number
    ): Promise<Array<PersonalSettings<any, any>>> {

        let settingsChanged = false;
        const settings: Array<PersonalSettings<any, any>> = [];
        for (const psExt of personalSettingsExtensions) {
            const ps = psExt.getPersonalSettings();

            const psConfig = configuration[ps.id];
            if (!psConfig) {
                configuration[ps.id] = ps.configuration;
                settingsChanged = true;
            }

            ps.configuration = psConfig;
            settings.push(ps);
        }

        if (settingsChanged) {
            await this.configurationService
                .saveComponentConfiguration(PERSONAL_SETTINGS, null, null, userId, configuration);
        }

        return settings;
    }

    private registerSaveDashboardConfigurationEvents(client: SocketIO.Socket): void {
        client.on(PersonalSettingsEvent.SAVE_PERSONAL_SETTINGS, async (data: SavePersonalSettingsRequest) => {

            const user = await this.userService.getUserByToken(data.token);
            const userId = user.UserID;

            for (const ps of data.personalSettings) {
                await this.configurationService
                    .saveComponentConfiguration(PERSONAL_SETTINGS, ps.id, null, userId, ps.configuration);
            }

            client.emit(PersonalSettingsEvent.PERSONAL_SETTINGS_SAVED);
        });
    }

}
