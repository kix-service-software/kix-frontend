/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { BrowserCacheService } from '../../modules/base-components/webapp/core/CacheService';
import { PersonalSetting } from '../../modules/user/model/PersonalSetting';
import { PersonalSettingsProperty } from '../../modules/user/model/PersonalSettingsProperty';
import { APIClient } from '../APIClient';

export class UserAPIClient extends APIClient {

    public static async getPersonalSettings(): Promise<PersonalSetting[]> {
        const response = await this.executeRequest(RequestMethod.GET, '/user/preferences');
        const result = await response.json();
        return result.preferences;
    }

    public static async setPreferences(parameter: Array<[string, any]>): Promise<void> {
        await this.executeRequest(RequestMethod.PATCH, '/user/preferences', { parameter });

        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.PERSONAL_SETTINGS);
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);

        if (parameter?.some((p) => p[0] === PersonalSettingsProperty.USER_LANGUAGE)) {
            BrowserCacheService.getInstance().deleteKeys(PersonalSettingsProperty.USER_LANGUAGE);
        }
    }

    public static async markAsSeen(objectType: KIXObjectType | string, objectIds: any[]): Promise<any> {
        await this.executeRequest(RequestMethod.PATCH, '/user/markObjectAsSeen', { objectType, objectIds });
    }


}