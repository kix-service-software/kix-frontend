/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { User } from '../../../user/model/User';
import { UserProperty } from '../../../user/model/UserProperty';
import { UserType } from '../../../user/model/UserType';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { MFAConfig } from '../../model/MFAConfig';
import { UserMFAProperty } from '../../model/UserMFAProperty';
import { MFASocketClient } from './MFASocketClient';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';

export class MFAService {

    private static INSTANCE: MFAService;

    public static getInstance(): MFAService {
        if (!MFAService.INSTANCE) {
            MFAService.INSTANCE = new MFAService();
        }
        return MFAService.INSTANCE;
    }

    private constructor() { }


    public async generateTOTPSecret(userId?: number, preference?: string): Promise<void> {
        const objectType = userId ? KIXObjectType.USER : KIXObjectType.CURRENT_USER;
        await KIXObjectService.updateObject(
            objectType, [[UserMFAProperty.EXEC_MFA_GENERATE_SECRET, preference]], userId
        ).catch(() => null);
        if (!userId) {
            BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
        }
    }

    public async getTOTPSecret(userId?: number, preference?: string): Promise<string> {
        preference = preference + '_Secret';
        let secret: string;
        if (userId) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = [UserProperty.PREFERENCES];
            const users = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, [userId], loadingOptions)
                .catch((): User[] => []);
            if (users?.length) {
                const otpPref = users[0].Preferences.find((p) => p.ID === preference);
                secret = otpPref?.Value;
            }
        } else {
            const otpSecretPreference = await AgentService.getInstance().getUserPreference(
                preference
            );
            secret = otpSecretPreference?.Value;
        }

        return secret;
    }

    public async loadMFAConfigs(userType?: UserType): Promise<MFAConfig[]> {
        return MFASocketClient.getInstance().loadMFAConfigs(userType);
    }

    public getMFAPreference(mfaConfig: MFAConfig, secret?: boolean): string {
        let result = `MFA_TOTP_${mfaConfig.name}`;
        if (secret) {
            result += '_Secret';
        }
        return result;
    }

}
