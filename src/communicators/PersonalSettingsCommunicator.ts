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
import { CommunicatorResponse } from '@kix/core/dist/common';

const PERSONAL_SETTINGS = "personal-settings";

export class PersonalSettingsCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return PERSONAL_SETTINGS;
    }

    protected registerEvents(): void {
        this.registerEventHandler(PersonalSettingsEvent.LOAD_PERSONAL_SETTINGS, this.loadPersonalSettings.bind(this));
        this.registerEventHandler(PersonalSettingsEvent.SAVE_PERSONAL_SETTINGS, this.savePersonalSettings.bind(this));
    }

    private async loadPersonalSettings(
        data: LoadPersonalSettingsRequest
    ): Promise<CommunicatorResponse<LoadPersonalSettingsResponse>> {
        const user = await this.userService.getUserByToken(data.token);
        const userId = user.UserID;

        const personalSettingsExtensions = await this.pluginService
            .getExtensions<IPersonalSettingsExtension>(KIXExtensions.PERSONAL_SETTINGS);

        const settings = await this.getPersonalSettings(personalSettingsExtensions, userId);

        const loadResponse = new LoadPersonalSettingsResponse(settings);
        return new CommunicatorResponse(PersonalSettingsEvent.PERSONAL_SETTINGS_LOADED, loadResponse);
    }

    private async savePersonalSettings(data: SavePersonalSettingsRequest): Promise<CommunicatorResponse<void>> {

        const user = await this.userService.getUserByToken(data.token);
        const userId = user.UserID;

        for (const ps of data.personalSettings) {
            await this.configurationService
                .saveComponentConfiguration(PERSONAL_SETTINGS, ps.id, userId, ps.configuration);
        }

        return new CommunicatorResponse(PersonalSettingsEvent.PERSONAL_SETTINGS_SAVED);
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
}
