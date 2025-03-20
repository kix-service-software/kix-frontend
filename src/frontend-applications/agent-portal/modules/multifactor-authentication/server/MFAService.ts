/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { AuthMethod } from '../../../model/AuthMethod';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { SearchOperator } from '../../search/model/SearchOperator';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';
import { User } from '../../user/model/User';
import { UserProperty } from '../../user/model/UserProperty';
import { UserType } from '../../user/model/UserType';
import { UserService } from '../../user/server/UserService';
import { MFAConfig } from '../model/MFAConfig';

export class MFAService {

    private static INSTANCE: MFAService;

    public static getInstance(): MFAService {
        if (!MFAService.INSTANCE) {
            MFAService.INSTANCE = new MFAService();
        }
        return MFAService.INSTANCE;
    }

    private constructor() { }

    public async isMFAEnabled(authMethods: AuthMethod[]): Promise<boolean> {
        return authMethods.some((am) => am.type === 'LOGIN' && am.MFA?.length > 0);
    }

    public async isUserMFAPEnabled(login: string, userType: UserType, mfaConfig: MFAConfig): Promise<boolean> {
        let result = false;

        const authMethods = await AuthenticationService.getInstance().getAuthMethods(userType)
            .catch((): AuthMethod[] => []);
        const loginMethod = authMethods?.find((am) => am.type === 'LOGIN');
        if (loginMethod && loginMethod.MFA?.length) {
            const preference = `MFA_TOTP_${mfaConfig?.name}`;

            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.filter = [
                new FilterCriteria(
                    UserProperty.USER_LOGIN, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, login)
            ];
            loadingOptions.includes = [UserProperty.PREFERENCES];
            loadingOptions.searchLimit = 1;

            const config = ConfigurationService.getInstance().getServerConfiguration();
            const token = config?.BACKEND_API_TOKEN;

            const users = await UserService.getInstance().loadObjects<User>(
                token, 'MFAService', KIXObjectType.USER, null, loadingOptions, null
            ).catch(() => new ObjectResponse<User>());

            if (users?.objects?.length) {
                const mfaPreference = users.objects[0].Preferences?.find((p) => p.ID === preference);
                result = Number(mfaPreference?.Value) === 1;
            }
        }

        return result;
    }

    public async loadMFAConfigs(userType?: UserType): Promise<MFAConfig[]> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const mfaSysconfig = await SysConfigService.getInstance().getSysConfigOptionValue(
            serverConfig?.BACKEND_API_TOKEN, 'MultiFactorAuthentication'
        ).catch(() => null);

        let mfaConfigs: MFAConfig[] = [];

        if (mfaSysconfig) {
            for (const key in mfaSysconfig) {
                if (Array.isArray(mfaSysconfig[key]) && mfaSysconfig[key]?.length) {
                    for (const config of mfaSysconfig[key]) {
                        if (!config.UsageContext || !userType || userType === config.UsageContext) {
                            const mfaConfig = new MFAConfig(
                                config.AuthType, config.Name, config.UsageContext, config.Enabled
                            );
                            mfaConfigs.push(mfaConfig);
                        }
                    }
                }
            }
        }

        return mfaConfigs;
    }

}