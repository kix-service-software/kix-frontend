/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { APIClient } from '../APIClient';
import { BrowserUtil } from '../../modules/base-components/webapp/core/BrowserUtil';
import { UserType } from '../../modules/user/model/UserType';
import { MFAConfig } from '../../modules/multifactor-authentication/model/MFAConfig';

export class MFAAPIClient extends APIClient {

    public static async isMFAEnabled(login: string, userType: UserType, mfaConfig: MFAConfig): Promise<boolean> {
        const query = { login, userType, mfaConfig: JSON.stringify(mfaConfig) };
        const response = await super.executeRequest(RequestMethod.GET, '/session/mfa', undefined, query)
            .catch((e): Response => {
                console.error(e);
                return null;
            });

        let isMFAEnabled = false;
        if (response?.status === 200) {
            const result = await response.json();
            isMFAEnabled = BrowserUtil.isBooleanTrue(result.mfaEnabled);
        }

        return isMFAEnabled;
    }

    public static async loadMFAConfigs(userType: UserType): Promise<MFAConfig[]> {
        const query = { userType };
        const response = await super.executeRequest(RequestMethod.GET, '/session/mfa/configs', undefined, query)
            .catch((e): Response => {
                console.error(e);
                return null;
            });

        let mfaConfigs: MFAConfig[] = [];
        if (response?.status === 200) {
            const result = await response.json();
            mfaConfigs = result.configs;
        }

        return mfaConfigs;
    }

}
