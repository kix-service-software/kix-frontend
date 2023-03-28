/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { ISocketRequest } from '../../../modules/base-components/webapp/core/ISocketRequest';
import { SocketResponse } from '../../../modules/base-components/webapp/core/SocketResponse';
import { PersonalSetting } from '../model/PersonalSetting';
import { PersonalSettingsResponse } from '../../../modules/base-components/webapp/core/PersonalSettingsResponse';
import { SocketEvent } from '../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../modules/base-components/webapp/core/SocketErrorResponse';
import { SetPreferencesRequest } from '../../../modules/base-components/webapp/core/SetPreferencesRequest';
import { UserService } from './UserService';
import { SetPreferencesResponse } from '../../../modules/base-components/webapp/core/SetPreferencesResponse';
import { GetCurrentUserRequest } from '../../../modules/base-components/webapp/core/GetCurrentUserRequest';
import { User } from '../model/User';
import { GetCurrentUserResponse } from '../../../modules/base-components/webapp/core/GetCurrentUserResponse';
import { PersonalSettingsService } from './PersonalSettingsService';

import cookie from 'cookie';
import { AgentEvent } from '../webapp/core/AgentEvent';
import { Socket } from 'socket.io';
import { CacheService } from '../../../server/services/cache';
import { PersonalSettingsProperty } from '../model/PersonalSettingsProperty';
import { HttpService } from '../../../server/services/HttpService';
import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class AgentNamespace extends SocketNameSpace {

    private static INSTANCE: AgentNamespace;

    public static getInstance(): AgentNamespace {
        if (!AgentNamespace.INSTANCE) {
            AgentNamespace.INSTANCE = new AgentNamespace();
        }
        return AgentNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'agent';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, AgentEvent.GET_PERSONAL_SETTINGS, this.getPersonalSettings.bind(this));
        this.registerEventHandler(client, AgentEvent.SET_PREFERENCES, this.setPreferences.bind(this));
        this.registerEventHandler(client, AgentEvent.GET_CURRENT_USER, this.getCurrentUser.bind(this));
        this.registerEventHandler(client, AgentEvent.CLEAR_CURRENT_USER_CACHE, this.clearCurrentUserCache.bind(this));
    }

    private async getPersonalSettings(data: ISocketRequest, client: Socket): Promise<SocketResponse> {
        const response = await PersonalSettingsService.getInstance().getPersonalSettings()
            .then((settings: PersonalSetting[]) =>
                new SocketResponse(
                    AgentEvent.GET_PERSONAL_SETTINGS_FINISHED, new PersonalSettingsResponse(data.requestId, settings)
                )
            ).catch((error: Error) => new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)
            ));
        return response;
    }

    private async setPreferences(data: SetPreferencesRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        const user = await UserService.getInstance().getUserByToken(token)
            .catch((): User => null);

        if (user) {
            const response = await UserService.getInstance().setPreferences(
                token, data.clientRequestId, data.parameter
            ).then(() => {
                if (
                    Array.isArray(data?.parameter) &&
                    data.parameter.some((p) => p[0] === PersonalSettingsProperty.USER_LANGUAGE)
                ) {
                    CacheService.getInstance().deleteKeys(PersonalSettingsProperty.USER_LANGUAGE);
                }
                return new SocketResponse(
                    AgentEvent.SET_PREFERENCES_FINISHED, new SetPreferencesResponse(data.requestId)
                );
            }).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));
            return response;
        }

        return new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user available'));
    }

    private async getCurrentUser(data: GetCurrentUserRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        let response;
        if (token) {
            const user = await HttpService.getInstance().getUserByToken(token, data.withStats).catch((error) => {
                response = new SocketResponse(SocketEvent.ERROR, error);
            });

            if (user) {
                response = new SocketResponse(
                    AgentEvent.GET_CURRENT_USER_FINISHED, new GetCurrentUserResponse(data.requestId, user)
                );
            }
        } else {
            response = new SocketResponse(SocketEvent.ERROR, 'User token required!');
        }
        return response;
    }

    private async clearCurrentUserCache(data: ISocketRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        const backendToken = AuthenticationService.getInstance().getBackendToken(token);
        const userId = AuthenticationService.getInstance().decodeToken(backendToken)?.UserID;

        CacheService.getInstance().deleteKeys(`${KIXObjectType.CURRENT_USER}_STATS_${userId}`);

        const response = new SocketResponse(
            AgentEvent.CLEAR_CURRENT_USER_CACHE_FINISHED, { requestId: data.requestId }
        );

        return response;
    }
}
