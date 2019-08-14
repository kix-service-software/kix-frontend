/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../SocketClient';
import { ClientStorageService } from '../ClientStorageService';
import { IdService } from '../IdService';
import {
    Error, KIXObjectType, PersonalSettingsResponse, ISocketRequest, User, GetCurrentUserRequest, AgentEvent,
    GetCurrentUserResponse, PersonalSetting, SetPreferencesRequest, SetPreferencesResponse, SocketEvent
} from '../../model';
import { CacheService } from '../cache';
import { SocketErrorResponse } from '../../common';

export class AgentSocketClient extends SocketClient {

    private agentSocket: SocketIO.Server;

    private static INSTANCE: AgentSocketClient = null;

    private currentUserRequestPromise: Promise<User> = null;

    public static getInstance(): AgentSocketClient {
        if (!AgentSocketClient.INSTANCE) {
            AgentSocketClient.INSTANCE = new AgentSocketClient();
        }

        return AgentSocketClient.INSTANCE;
    }

    public constructor() {
        super();
        this.agentSocket = this.createSocket('agent');
    }

    public async getCurrentUser(useCache: boolean = true): Promise<User> {
        if (!useCache) {
            CacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
        }

        if (await CacheService.getInstance().has(KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER)) {
            return await CacheService.getInstance().get(KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER);
        }

        if (this.currentUserRequestPromise) {
            return await this.currentUserRequestPromise;
        }

        const requestId = IdService.generateDateBasedId();
        const currentUserRequest = new GetCurrentUserRequest(
            ClientStorageService.getToken(),
            requestId,
            ClientStorageService.getClientRequestId()
        );


        this.currentUserRequestPromise = new Promise<User>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.GET_CURRENT_USER);
            }, 30000);

            this.agentSocket.on(
                AgentEvent.GET_CURRENT_USER_FINISHED, async (result: GetCurrentUserResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        await CacheService.getInstance().set(
                            KIXObjectType.CURRENT_USER, result.currentUser, KIXObjectType.CURRENT_USER
                        );
                        this.currentUserRequestPromise = null;
                        resolve(result.currentUser);
                    }
                });

            this.agentSocket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                window.clearTimeout(timeout);
                console.error('Socket Error: getCurrentUser');
                console.error(error.error);
                reject(error.error);
            });

            this.agentSocket.emit(AgentEvent.GET_CURRENT_USER, currentUserRequest);
        });

        return await this.currentUserRequestPromise;
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        return new Promise<PersonalSetting[]>((resolve, reject) => {

            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.GET_PERSONAL_SETTINGS);
            }, 30000);

            this.agentSocket.on(
                AgentEvent.GET_PERSONAL_SETTINGS_FINISHED, (response: PersonalSettingsResponse) => {
                    if (response.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(response.personalSettings);
                    }
                });

            this.agentSocket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error('Socket Error: getPersonalSettings');
                    console.error(error.error);
                    resolve([]);
                }
            });

            const request: ISocketRequest = {
                requestId, token,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.agentSocket.emit(AgentEvent.GET_PERSONAL_SETTINGS, request);
        });
    }

    public async setPreferences(parameter: Array<[string, any]>): Promise<any> {
        const requestId = IdService.generateDateBasedId();

        const preferencesRequest = new SetPreferencesRequest(
            ClientStorageService.getToken(),
            requestId,
            ClientStorageService.getClientRequestId(),
            parameter
        );

        return new Promise((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.SET_PREFERENCES);
            }, 30000);

            this.agentSocket.on(
                AgentEvent.SET_PREFERENCES_FINISHED, async (result: SetPreferencesResponse) => {
                    if (result.requestId === requestId) {
                        CacheService.getInstance().deleteKeys(KIXObjectType.PERSONAL_SETTINGS);
                        this.currentUserRequestPromise = null;
                        window.clearTimeout(timeout);
                        resolve(result);
                    }
                });

            this.agentSocket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error('Socket Error: setPreferences');
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.agentSocket.emit(AgentEvent.SET_PREFERENCES, preferencesRequest);
        });
    }
}
