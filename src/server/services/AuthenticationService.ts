/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-classes-per-file */

import { ConfigurationService } from './ConfigurationService';
import { HttpService } from '../../frontend-applications/agent-portal/server/services/HttpService';
import { SessionResponse } from '../model/SessionResponse';
import { LoginResponse } from '../model/LoginResponse';
import { SocketAuthenticationError } from '../model/SocketAuthenticationError';
import { UserLogin } from '../../frontend-applications/agent-portal/modules/user/model/UserLogin';
import { UserType } from '../../frontend-applications/agent-portal/modules/user/model/UserType';

import jwt from 'jsonwebtoken';
import { LoggingService } from './LoggingService';
import { HTTPResponse } from '../../frontend-applications/agent-portal/server/services/HTTPResponse';
import { IncomingHttpHeaders } from 'node:http';
import { AuthMethod } from '../../frontend-applications/agent-portal/model/AuthMethod';
import { PasswordResetState } from '../../frontend-applications/agent-portal/model/PasswordResetState';
import { MFAToken } from '../../frontend-applications/agent-portal/modules/multifactor-authentication/model/MFAToken';
import { ClientNotificationService } from '../../frontend-applications/agent-portal/server/services/ClientNotificationService';
import { BackendNotification } from '../../frontend-applications/agent-portal/model/BackendNotification';
import { SysConfigKey } from '../../frontend-applications/agent-portal/modules/sysconfig/model/SysConfigKey';
import { CacheService } from '../../frontend-applications/agent-portal/server/services/cache';
import { randomBytes } from 'node:crypto';
import { FastifyRequest } from 'fastify';

export class AuthenticationService {

    private static INSTANCE: AuthenticationService;

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.INSTANCE) {
            AuthenticationService.INSTANCE = new AuthenticationService();
        }
        return AuthenticationService.INSTANCE;
    }

    public tokenSecret: string;
    public tokenSalt: string;

    private constructor() {
        this.tokenSecret = ConfigurationService.getEnvString('TOKEN_SECRET')
            || Buffer.from(randomBytes(32)).toString('hex');
        this.tokenSalt = ConfigurationService.getEnvString('TOKEN_SALT')
            || Buffer.from(randomBytes(16)).toString('hex');

        if (this.tokenSalt.length > 16) {
            this.tokenSalt = this.tokenSalt.substring(0, 16);
        }

        ClientNotificationService.getInstance().registerNotificationListener(
            'AuthenticationService',
            this.handleBackendNotification.bind(this)
        );
    }

    private async handleBackendNotification(events: BackendNotification[]): Promise<void> {
        const sysConfigOptionEvents = events?.filter((e) => e.Namespace === 'SysConfigOption');
        if (sysConfigOptionEvents?.some((sco) => sco.ObjectID === SysConfigKey.USER_PASSWORD_RESET_ENABLED)) {
            await CacheService.getInstance().deleteKeys('OPTION_COLLECTION');
        }
    }

    public createToken(userLogin: string, backendToken: string): string {
        const token = jwt.sign({ userLogin, backendToken, created: Date.now() }, this.tokenSecret);
        return token;
    }

    public getBackendToken(token: string): string {
        const beToken = ConfigurationService.getBackendAPIToken();
        if (beToken === token) {
            return token;
        }

        const decoded = this.decodeToken(token);
        return decoded && decoded.backendToken ? decoded.backendToken : null;
    }

    public decodeToken(token: string, secret: string = this.tokenSecret): any {
        return jwt.decode(token, secret);
    }

    public async validateToken(token: string, clientRequestId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            HttpService.getInstance().get<SessionResponse>(
                'session', {}, token, clientRequestId, null, false
            ).then((response: HTTPResponse<SessionResponse>) => {
                resolve(
                    typeof response?.responseData?.Session !== 'undefined' &&
                    response?.responseData?.Session !== null
                );
            }).catch((error) => {
                resolve(false);
            });
        });
    }

    public async login(
        login: string, password: string, userType: UserType, negotiateToken: string, mfaToken: MFAToken,
        clientRequestId: string, headers: IncomingHttpHeaders, fakeLogin?: boolean,
        additionalData?: any
    ): Promise<string> {
        const userLogin = new UserLogin(login, password, userType, negotiateToken, mfaToken);

        if (additionalData) {
            for (const key in additionalData) {
                if (additionalData[key]) {
                    userLogin[key] = additionalData[key];
                }
            }
        }

        if (!mfaToken) {
            delete userLogin.MFAToken;
        }

        const response = await HttpService.getInstance().post<LoginResponse>(
            'auth', userLogin, null, clientRequestId, undefined, false, null, headers
        );
        const token = fakeLogin ? response.Token : this.createToken(login, response.Token);

        const user = await HttpService.getInstance().getUserByToken(token);
        if (!user?.Contact?.ID) {
            await this.logout(token);
            LoggingService.getInstance().error(`No contact available for user ${login}!`);
            throw new SocketAuthenticationError('No contact available for user!');
        }

        HttpService.getInstance().setUserRoleIds(user);

        return token;
    }

    public async logout(token: string): Promise<boolean> {
        await HttpService.getInstance().delete(['session'], token, null).catch((error) => null);
        return true;
    }

    public getUsageContext(token: string): string {
        const backendToken = this.getBackendToken(token);
        const tokenValue = this.decodeToken(backendToken);
        return tokenValue.UserType;
    }

    public async getAuthMethods(userType: UserType = UserType.AGENT): Promise<AuthMethod[]> {
        const authMethods: AuthMethod[] = [];
        const response = await HttpService.getInstance().get(
            'auth', { UserType: userType }, null, 'AuthenticationService', 'AuthMethods', false
        ).catch((e) => {
            LoggingService.getInstance().error(e);
            return new HTTPResponse(null, new Map());
        });

        if (response?.responseData) {
            const methods = response.responseData['AuthMethods'];
            if (Array.isArray(methods)) {
                for (const method of methods) {
                    const authMethod = new AuthMethod(
                        method.Type, Boolean(method.PreAuth), method.Data, method.Name, method.MFA
                    );
                    authMethods.push(authMethod);
                }
            }
        }

        return authMethods;
    }

    public async getAuthMethod(name: string, userType: UserType = UserType.AGENT): Promise<AuthMethod> {
        const methods = await this.getAuthMethods(userType);
        return methods?.find((m) => m.name === name);
    }

    public async createUserPasswordResetRequest(userLogin: string, userType: UserType = UserType.AGENT): Promise<any> {
        return await HttpService.getInstance().post(
            'auth/password-reset', { UserLogin: userLogin, UserType: userType }, null, null
        );
    }

    public async getUserPasswordResetEnabled(userType: UserType = UserType.AGENT): Promise<boolean> {
        const response = await HttpService.getInstance().options(
            undefined, 'auth/password-reset', undefined, undefined, undefined
        ).catch((e) => {
            LoggingService.getInstance().error(e);
            return null;
        });

        if (response?.data?.Methods?.POST?.Parameters?.UserType?.OneOf?.some((am) => am === userType)) {
            return true;
        }

        return false;
    }

    public async sendUserPasswordResetRequestConfirmation(
        resetToken: string, userType: UserType = UserType.AGENT
    ): Promise<PasswordResetState> {
        let pwResetState = PasswordResetState.ERROR;

        if (resetToken) {
            const response = await HttpService.getInstance().patch<any>('auth/password-reset/' + resetToken,
                { UserType: userType }, undefined, undefined, undefined, undefined
            ).catch(() => undefined);

            pwResetState = response?.Code === 'OK' ? PasswordResetState.CONFIRMED : PasswordResetState.ERROR;
        }

        return pwResetState;
    }

    public static setSessionCookie(req: FastifyRequest, application: string, token: string): void {
        (req as any)[`${application}-session`].set('session', token);
    }

    public static deleteSessionCookie(req: FastifyRequest, application: string): void {
        (req as any)[`${application}-session`].delete();
    }

}
