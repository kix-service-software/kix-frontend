import { PluginService } from "./PluginService";
import { KIXExtensions } from "../core/extensions";
import { PersonalSetting, IPersonalSettingsExtension } from "../core/model";

export class PersonalSettingsService {

    private static INSTANCE: PersonalSettingsService;

    public static getInstance(): PersonalSettingsService {
        if (!PersonalSettingsService.INSTANCE) {
            PersonalSettingsService.INSTANCE = new PersonalSettingsService();
        }
        return PersonalSettingsService.INSTANCE;
    }

    private constructor() { }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        const settingsExtensions = await PluginService.getInstance().getExtensions<IPersonalSettingsExtension>(
            KIXExtensions.PERSONAL_SETTINGS
        );

        let settings: PersonalSetting[] = [];

        settingsExtensions.forEach((se) => {
            settings = [...settings, ...se.getPersonalSettings()];
        });

        return settings;
    }
}
