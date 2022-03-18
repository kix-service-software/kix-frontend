/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../modules/base-components/webapp/core/SocketClient';
import { User } from '../../model/User';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../model/IdService';
import { GetCurrentUserRequest } from '../../../../modules/base-components/webapp/core/GetCurrentUserRequest';
import { ClientStorageService } from '../../../../modules/base-components/webapp/core/ClientStorageService';
import { AgentEvent } from './AgentEvent';
import { GetCurrentUserResponse } from '../../../../modules/base-components/webapp/core/GetCurrentUserResponse';
import { SocketEvent } from '../../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../../modules/base-components/webapp/core/SocketErrorResponse';
import { PersonalSetting } from '../../model/PersonalSetting';
import { PersonalSettingsResponse } from '../../../../modules/base-components/webapp/core/PersonalSettingsResponse';
import { ISocketRequest } from '../../../../modules/base-components/webapp/core/ISocketRequest';
import { SetPreferencesRequest } from '../../../../modules/base-components/webapp/core/SetPreferencesRequest';
import { SetPreferencesResponse } from '../../../../modules/base-components/webapp/core/SetPreferencesResponse';
import { BrowserCacheService } from '../../../../modules/base-components/webapp/core/CacheService';
import { PersonalSettingsProperty } from '../../model/PersonalSettingsProperty';

export class AgentSocketClient extends SocketClient {

    private static INSTANCE: AgentSocketClient = null;

    public static getInstance(): AgentSocketClient {
        if (!AgentSocketClient.INSTANCE) {
            AgentSocketClient.INSTANCE = new AgentSocketClient();
        }

        return AgentSocketClient.INSTANCE;
    }

    public constructor() {
        super('agent');
    }

    public async getCurrentUser(useCache: boolean = true): Promise<User> {
        let currentUserRequestPromise;
        if (useCache && BrowserCacheService.getInstance().has(KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER)) {
            currentUserRequestPromise = BrowserCacheService.getInstance().get(
                KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER
            );
        }

        if (!currentUserRequestPromise) {
            const requestId = IdService.generateDateBasedId();
            const currentUserRequest = new GetCurrentUserRequest(
                requestId,
                ClientStorageService.getClientRequestId(),
                useCache
            );

            const socketTimeout = ClientStorageService.getSocketTimeout();
            currentUserRequestPromise = new Promise<User>((resolve, reject) => {

                if (this.socket) {
                    const timeout = window.setTimeout(() => {
                        reject('Timeout: ' + AgentEvent.GET_CURRENT_USER);
                    }, socketTimeout);

                    this.socket.on(
                        AgentEvent.GET_CURRENT_USER_FINISHED, async (result: GetCurrentUserResponse) => {
                            if (result.requestId === requestId) {
                                window.clearTimeout(timeout);
                                resolve(new User(result.currentUser));
                            }
                        });

                    this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                        window.clearTimeout(timeout);
                        console.error('Socket Error: getCurrentUser');
                        console.error(error.error);
                        reject(error.error);
                    });

                    this.socket.emit(AgentEvent.GET_CURRENT_USER, currentUserRequest);
                } else {
                    resolve(null);
                }
            });
        }

        BrowserCacheService.getInstance().set(
            KIXObjectType.CURRENT_USER, currentUserRequestPromise, KIXObjectType.CURRENT_USER
        );

        return currentUserRequestPromise;
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<PersonalSetting[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.GET_PERSONAL_SETTINGS);
            }, socketTimeout);

            this.socket.on(
                AgentEvent.GET_PERSONAL_SETTINGS_FINISHED, (response: PersonalSettingsResponse) => {
                    if (response.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(response.personalSettings);
                    }
                });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error('Socket Error: getPersonalSettings');
                    console.error(error.error);
                    resolve([]);
                }
            });

            const request: ISocketRequest = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(AgentEvent.GET_PERSONAL_SETTINGS, request);
        });
    }

    public async setPreferences(parameter: Array<[string, any]>): Promise<any> {
        this.checkSocketConnection();

        const requestId = IdService.generateDateBasedId();

        const preferencesRequest = new SetPreferencesRequest(
            requestId,
            ClientStorageService.getClientRequestId(),
            parameter
        );

        const socketTimeout = ClientStorageService.getSocketTimeout();

        return new Promise((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.SET_PREFERENCES);
            }, socketTimeout);

            this.socket.on(
                AgentEvent.SET_PREFERENCES_FINISHED, async (result: SetPreferencesResponse) => {
                    if (result.requestId === requestId) {
                        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.PERSONAL_SETTINGS);
                        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);

                        if (
                            Array.isArray(parameter) &&
                            parameter.some((p) => p[0] === PersonalSettingsProperty.USER_LANGUAGE)
                        ) {
                            BrowserCacheService.getInstance().deleteKeys(PersonalSettingsProperty.USER_LANGUAGE);
                        }

                        window.clearTimeout(timeout);
                        resolve(result);
                    }
                });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error('Socket Error: setPreferences');
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(AgentEvent.SET_PREFERENCES, preferencesRequest);
        });
    }
}
