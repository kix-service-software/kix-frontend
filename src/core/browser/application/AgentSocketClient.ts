import { SocketClient } from '../SocketClient';
import {
    GetCurrentUserRequest, User, SetPreferencesResponse, GetCurrentUserResponse,
    SetPreferencesRequest, PersonalSetting, AgentEvent
} from '../../model/kix/user';
import { ClientStorageService } from '../ClientStorageService';
import { IdService } from '../IdService';
import { Error, KIXObjectType, PersonalSettingsResponse, ISocketRequest } from '../../model';
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

    public async getCurrentUser(): Promise<User> {
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
                        resolve(result.currentUser);
                    }
                });

            this.agentSocket.on(AgentEvent.GET_CURRENT_USER_ERROR, (error: Error) => {
                window.clearTimeout(timeout);
                console.error('Socket Error: getCurrentUser');
                console.error(error);
                reject(error);
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

            this.agentSocket.on(AgentEvent.GET_PERSONAL_SETTINGS_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error('Socket Error: getPersonalSettings');
                    console.error(error);
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
                        await CacheService.getInstance().deleteKeys(KIXObjectType.PERSONAL_SETTINGS);
                        this.currentUserRequestPromise = null;
                        window.clearTimeout(timeout);
                        resolve(result);
                    }
                });

            this.agentSocket.on(AgentEvent.SET_PREFERENCES_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error('Socket Error: setPreferences');
                    console.error(error);
                    reject(error);
                }
            });

            this.agentSocket.emit(AgentEvent.SET_PREFERENCES, preferencesRequest);
        });
    }
}
