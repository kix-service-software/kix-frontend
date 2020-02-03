/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "../../../../modules/base-components/webapp/core/SocketClient";
import { User } from "../../model/User";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { IdService } from "../../../../model/IdService";
import { GetCurrentUserRequest } from "../../../../modules/base-components/webapp/core/GetCurrentUserRequest";
import { ClientStorageService } from "../../../../modules/base-components/webapp/core/ClientStorageService";
import { AgentEvent } from "./AgentEvent";
import { GetCurrentUserResponse } from "../../../../modules/base-components/webapp/core/GetCurrentUserResponse";
import { SocketEvent } from "../../../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../../../modules/base-components/webapp/core/SocketErrorResponse";
import { PersonalSetting } from "../../model/PersonalSetting";
import { PersonalSettingsResponse } from "../../../../modules/base-components/webapp/core/PersonalSettingsResponse";
import { ISocketRequest } from "../../../../modules/base-components/webapp/core/ISocketRequest";
import { SetPreferencesRequest } from "../../../../modules/base-components/webapp/core/SetPreferencesRequest";
import { SetPreferencesResponse } from "../../../../modules/base-components/webapp/core/SetPreferencesResponse";
import { BrowserCacheService } from "../../../../modules/base-components/webapp/core/CacheService";

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
            BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
        }

        if (BrowserCacheService.getInstance().has(KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER)) {
            return BrowserCacheService.getInstance().get(KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER);
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

        const socketTimeout = ClientStorageService.getSocketTimeout();

        this.currentUserRequestPromise = new Promise<User>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.GET_CURRENT_USER);
            }, socketTimeout);

            this.agentSocket.on(
                AgentEvent.GET_CURRENT_USER_FINISHED, async (result: GetCurrentUserResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        BrowserCacheService.getInstance().set(
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
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<PersonalSetting[]>((resolve, reject) => {

            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.GET_PERSONAL_SETTINGS);
            }, socketTimeout);

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

        const socketTimeout = ClientStorageService.getSocketTimeout();

        return new Promise((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.SET_PREFERENCES);
            }, socketTimeout);

            this.agentSocket.on(
                AgentEvent.SET_PREFERENCES_FINISHED, async (result: SetPreferencesResponse) => {
                    if (result.requestId === requestId) {
                        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.PERSONAL_SETTINGS);
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
