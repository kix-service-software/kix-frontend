import { KIXCommunicator } from './KIXCommunicator';
import {
    LoadPersonalSettingsRequest,
    LoadPersonalSettingsResponse,
    PersonalSettingsEvent,
    PersonalSettings,
    SavePersonalSettingsRequest,
    SocketEvent
} from '@kix/core/dist/model';

import { IPersonalSettingsExtension, KIXExtensions } from '@kix/core/dist/extensions';

const PERSONAL_SETTINGS = "personal-settings";

export class PersonalSettingsCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/' + PERSONAL_SETTINGS);
        nsp
            .use(this.authenticationService.isSocketAuthenticated.bind(this.authenticationService))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerPersonalSettingsEvents(client);
                this.registerSavePersonalSettingsEvents(client);
            });
    }

    private registerPersonalSettingsEvents(client: SocketIO.Socket): void {
        client.on(PersonalSettingsEvent.LOAD_PERSONAL_SETTINGS, async (data: LoadPersonalSettingsRequest) => {

            const user = await this.userService.getUserByToken(data.token);
            const userId = user.UserID;

            const personalSettingsExtensions = await this.pluginService
                .getExtensions<IPersonalSettingsExtension>(KIXExtensions.PERSONAL_SETTINGS);

            const settings = await this.getPersonalSettings(personalSettingsExtensions, userId);

            const loadResponse = new LoadPersonalSettingsResponse(settings);
            client.emit(PersonalSettingsEvent.PERSONAL_SETTINGS_LOADED, loadResponse);
        });
    }

    private async getPersonalSettings(
        personalSettingsExtensions: IPersonalSettingsExtension[], userId: number
    ): Promise<PersonalSettings[]> {

        const settings: PersonalSettings[] = [];
        for (const psExt of personalSettingsExtensions) {
            const ps = await psExt.getPersonalSettings();

            let personalSettings =
                await this.configurationService.getComponentConfiguration(PERSONAL_SETTINGS, ps.id, userId);

            if (!personalSettings) {
                personalSettings = ps.configuration;
                await this.configurationService
                    .saveComponentConfiguration(PERSONAL_SETTINGS, ps.id, userId, personalSettings);
            }

            ps.configuration = personalSettings;
            settings.push(ps);
        }

        return settings;
    }

    private registerSavePersonalSettingsEvents(client: SocketIO.Socket): void {
        client.on(PersonalSettingsEvent.SAVE_PERSONAL_SETTINGS, async (data: SavePersonalSettingsRequest) => {

            const user = await this.userService.getUserByToken(data.token);
            const userId = user.UserID;

            for (const ps of data.personalSettings) {
                await this.configurationService
                    .saveComponentConfiguration(PERSONAL_SETTINGS, ps.id, userId, ps.configuration);
            }

            client.emit(PersonalSettingsEvent.PERSONAL_SETTINGS_SAVED);
        });
    }

}
