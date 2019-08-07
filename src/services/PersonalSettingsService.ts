/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
