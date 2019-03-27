import { SocketListener } from "../SocketListener";
import {
    UserType, AuthenticationResult, LoginRequest, GetCurrentUserRequest,
    User, SetPreferencesResponse, GetCurrentUserResponse, SetPreferencesRequest, PersonalSetting, AgentEvent
} from "../../model/kix/user";
import { ClientStorageService } from "../ClientStorageService";
import { IdService } from "../IdService";
import { Error } from "../../model";

export class AgentSocketListener extends SocketListener {

    private authenticationSocket: SocketIO.Server;

    private static INSTANCE: AgentSocketListener = null;

    public static getInstance(): AgentSocketListener {
        if (!AgentSocketListener.INSTANCE) {
            AgentSocketListener.INSTANCE = new AgentSocketListener();
        }

        return AgentSocketListener.INSTANCE;
    }

    public constructor() {
        super();
        this.authenticationSocket = this.createSocket("authentication", false);
    }

    public login(userName: string, password: string, userType: UserType): Promise<boolean> {
        return new Promise((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.LOGIN);
            }, 30000);

            this.authenticationSocket.on(AgentEvent.AUTHORIZED, (result: AuthenticationResult) => {
                document.cookie = "token=" + result.token;
                resolve(true);
            });

            this.authenticationSocket.on(AgentEvent.UNAUTHORIZED, (error) => {
                resolve(false);
            });

            const request = new LoginRequest(userName, password, UserType.AGENT);
            this.authenticationSocket.emit(AgentEvent.LOGIN, request);
        });
    }

    public async getCurrentUser(cache: boolean = true): Promise<User> {
        const requestId = IdService.generateDateBasedId();
        const currentUserRequest = new GetCurrentUserRequest(
            ClientStorageService.getToken(),
            requestId,
            cache
        );

        return new Promise<User>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AgentEvent.SET_PREFERENCES);
            }, 30000);

            this.authenticationSocket.on(
                AgentEvent.GET_CURRENT_USER_FINISHED, (result: GetCurrentUserResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
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
