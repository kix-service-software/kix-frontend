import { SocketClient } from '../SocketClient';
import {
    GetCurrentUserRequest, User, SetPreferencesResponse, GetCurrentUserResponse,
    SetPreferencesRequest, PersonalSetting, AgentEvent
} from '../../model/kix/user';
import { ClientStorageService } from '../ClientStorageService';
import { IdService } from '../IdService';
import { Error, KIXObjectType } from '../../model';
import { CacheService } from '../cache';

export class AgentSocketClient extends SocketClient {

    private authenticationSocket: SocketIO.Server;

    private static INSTANCE: AgentSocketClient = null;

    public static getInstance(): AgentSocketClient {
        if (!AgentSocketClient.INSTANCE) {
            AgentSocketClient.INSTANCE = new AgentSocketClient();
        }

        return AgentSocketClient.INSTANCE;
    }

    public constructor() {
        super();
        this.authenticationSocket = this.createSocket('agent');
    }

    public async getCurrentUser(cache: boolean = true): Promise<User> {
        if (await CacheService.getInstance().has(KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER)) {
            return await CacheService.getInstance().get(KIXObjectType.CURRENT_USER, KIXObjectType.CURRENT_USER);
        }

        const requestId = IdService.generateDateBasedId();
        const currentUserRequest = new GetCurrentUserRequest(
            ClientStorageService.getToken(),
            requestId,
            ClientStorageService.getClientRequestId(),
            cache
        );

        return new Promise<User>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.SET_PREFERENCES);
            }, 30000);

            this.authenticationSocket.on(
                AgentEvent.GET_CURRENT_USER_FINISHED, async (result: GetCurrentUserResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        await CacheService.getInstance().set(
                            KIXObjectType.CURRENT_USER, result.currentUser, KIXObjectType.CURRENT_USER
                        );
                        resolve(result.currentUser);
                    }
                });

            this.authenticationSocket.on(AgentEvent.GET_CURRENT_USER_ERROR, (error: Error) => {
                window.clearTimeout(timeout);
                console.error('Socket Error: getCurrentUser');
                console.error(error);
                reject(error);
            });

            this.authenticationSocket.emit(AgentEvent.GET_CURRENT_USER, currentUserRequest);
        });
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        return new Promise<PersonalSetting[]>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.GET_PERSONAL_SETTINGS);
            }, 30000);

            this.authenticationSocket.on(
                AgentEvent.GET_PERSONAL_SETTINGS_FINISHED, (settings: PersonalSetting[]) => {
                    window.clearTimeout(timeout);
                    resolve(settings);
                });

            this.authenticationSocket.on(AgentEvent.GET_PERSONAL_SETTINGS_ERROR, (error: Error) => {
                window.clearTimeout(timeout);
                console.error('Socket Error: getPersonalSettings');
                console.error(error);
                resolve([]);
            });

            this.authenticationSocket.emit(AgentEvent.GET_PERSONAL_SETTINGS);
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

            this.authenticationSocket.on(
                AgentEvent.SET_PREFERENCES_FINISHED, (result: SetPreferencesResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result);
                    }
                });

            this.authenticationSocket.on(AgentEvent.SET_PREFERENCES_ERROR, (error: Error) => {
                window.clearTimeout(timeout);
                console.error('Socket Error: setPreferences');
                console.error(error);
                reject(error);
            });

            this.authenticationSocket.emit(AgentEvent.SET_PREFERENCES, preferencesRequest);
        });
    }
}
