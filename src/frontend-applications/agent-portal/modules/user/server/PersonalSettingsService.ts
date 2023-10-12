/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentPortalExtensions } from '../../../server/extensions/AgentPortalExtensions';
import { PersonalSetting } from '../model/PersonalSetting';
import { PluginService } from '../../../../../server/services/PluginService';
import { IPersonalSettingsExtension } from '../../../server/extensions/IPersonalSettingsExtension';

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
            AgentPortalExtensions.PERSONAL_SETTINGS
        );

        let settings: PersonalSetting[] = [];

        settingsExtensions.forEach((se) => {
            settings = [...settings, ...se.getPersonalSettings()];
        });

        return settings;
    }
}
