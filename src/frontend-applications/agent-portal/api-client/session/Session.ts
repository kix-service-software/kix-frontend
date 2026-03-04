/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LoginRequest } from '../../modules/base-components/webapp/core/LoginRequest';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { BrowserCacheService } from '../../modules/base-components/webapp/core/CacheService';
import { UserType } from '../../modules/user/model/UserType';
import { LoginResult } from '../../modules/base-components/model/LoginResult';
import { MFAToken } from '../../modules/multifactor-authentication/model/MFAToken';
import { APIClient } from '../APIClient';
import { User } from '../../modules/user/model/User';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { WindowListener } from '../../modules/base-components/webapp/core/WindowListener';
import { ClientStorageService } from '../../modules/base-components/webapp/core/ClientStorageService';

export class SessionAPIClient extends APIClient {

    public static async login(
        userName: string, password: string, negotiateToken: string, redirectUrl: string,
        mfaToken?: MFAToken, fakeLogin?: boolean, userType: UserType = UserType.AGENT
    ): Promise<LoginResult> {

        const request = new LoginRequest(
            userName, password, userType, negotiateToken, redirectUrl, mfaToken, fakeLogin
        );

        const response = await this.executeRequest(RequestMethod.POST, '/session', request);

        let loginResult: LoginResult;
        if (response.status === 201) {
            const result = await response.json();
            loginResult = new LoginResult(true);
            if (!fakeLogin) {
                window.location.href = result?.redirectUrl || '/';
            }
        } else {
            loginResult = new LoginResult(false, false);
        }

        return loginResult;
    }

    public static async logout(): Promise<void> {
        const response = await this.executeRequest(RequestMethod.DELETE, '/session');
        if (response.status === 204) {
            WindowListener.getInstance().removeBrowserListener();
            const baseRoute = ClientStorageService.getBaseRoute();
            window.location.replace(`${baseRoute}/auth`);
        }
    }

    public static async validateToken(): Promise<boolean> {
        const response = await this.executeRequest(RequestMethod.GET, '/session/validatetoken');
        return response.status === 200;
    }

    public static async checkPermissions(permissions: UIComponentPermission[]): Promise<boolean> {
        const key = JSON.stringify(permissions);
        let requestPromise = BrowserCacheService.getInstance().get(key);
        if (!requestPromise) {
            requestPromise = this.createPermissionRequest(permissions);
            BrowserCacheService.getInstance().set(key, requestPromise, 'OPTION_REQUEST');
        }

        return requestPromise;
    }

    private static createPermissionRequest(permissions: UIComponentPermission[]): Promise<boolean> {
        return new Promise(async (resolve, reject) => {

            if (!permissions || !permissions.length) {
                resolve(true);
                return;
            }

            const response = await this.executeRequest(
                RequestMethod.GET, '/session/permissioncheck', undefined, { permissions: JSON.stringify(permissions) }
            ).catch((e): Response => {
                return;
            });
            resolve(response?.status === 200);
        });
    }

    public static createUserPasswordResetRequest(userLogin: string, userType: UserType = UserType.AGENT): void {
        this.executeRequest(RequestMethod.POST, '/password-reset', undefined, { userType, userLogin });
    }

    public static async getCurrentUser(): Promise<User> {
        const cacheType = KIXObjectType.CURRENT_USER;
        let currentUser = BrowserCacheService.getInstance().get(cacheType, cacheType);
        if (!currentUser) {
            let currentUserRequestPromise = BrowserCacheService.getInstance().get(`${cacheType}_promise`, cacheType);
            if (!currentUserRequestPromise) {
                currentUserRequestPromise = this.loadCurrentUser();
                BrowserCacheService.getInstance().set(`${cacheType}_promise`, currentUserRequestPromise, cacheType);
            }

            if (currentUserRequestPromise) {
                currentUser = new User(await currentUserRequestPromise);
                BrowserCacheService.getInstance().set(cacheType, currentUser, cacheType);
            }
        }
        return currentUser;
    }

    private static async loadCurrentUser(): Promise<User> {
        const response = await this.executeRequest(RequestMethod.GET, '/session/user');
        const result = await response.json();
        return result.user;
    }

}
