import {
    AuthenticationResult, LoginRequest, AgentEvent, SocketEvent, Error, PersonalSetting,
    SetPreferencesRequest, SetPreferencesResponse, KIXObjectCache,
    KIXObjectType, GetCurrentUserRequest, User, GetCurrentUserResponse
} from '../core/model';
import { CommunicatorResponse } from '../core/common';
import { KIXCommunicator } from './KIXCommunicator';
import { LoggingService, AuthenticationService, UserService } from '../core/services';
import { PersonalSettingsService } from '../services';
import { ServiceMethod } from '../core/browser';

export class AgentCommunicator extends KIXCommunicator {

    private static INSTANCE: AgentCommunicator;

    public static getInstance(): AgentCommunicator {
        if (!AgentCommunicator.INSTANCE) {
            AgentCommunicator.INSTANCE = new AgentCommunicator();
        }
        return AgentCommunicator.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'authentication';
    }

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/' + this.getNamespace());
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, AgentEvent.LOGIN, this.login.bind(this));
        this.registerEventHandler(client, AgentEvent.GET_PERSONAL_SETTINGS, this.getPersonalSettings.bind(this));
        this.registerEventHandler(client, AgentEvent.SET_PREFERENCES, this.setPreferences.bind(this));
        this.registerEventHandler(client, AgentEvent.GET_CURRENT_USER, this.getCurrentUser.bind(this));
    }

    private async login(data: LoginRequest): Promise<CommunicatorResponse<AuthenticationResult>> {
        let response;
        await AuthenticationService.getInstance()
            .login(data.userName, data.password, data.userType)
            .then((token: string) => {
                response = new CommunicatorResponse(
                    AgentEvent.AUTHORIZED,
                    new AuthenticationResult(token, '/'));
            }).catch((error: Error) => {
                LoggingService.getInstance().error(error.Code + ' - ' + error.Message);
                response = new CommunicatorResponse(AgentEvent.UNAUTHORIZED, error);
            });
        return response;
    }

    private async getPersonalSettings(): Promise<CommunicatorResponse<PersonalSetting[]>> {
        let response;
        await PersonalSettingsService.getInstance().getPersonalSettings()
            .then((settings: PersonalSetting[]) => {
                response = new CommunicatorResponse(AgentEvent.GET_PERSONAL_SETTINGS_FINISHED, settings);
            }).catch((error: Error) => {
                LoggingService.getInstance().error(error.Code + ' - ' + error.Message);
                response = new CommunicatorResponse(AgentEvent.GET_PERSONAL_SETTINGS_ERROR, error);
            });
        return response;
    }

    private async setPreferences(data: SetPreferencesRequest): Promise<CommunicatorResponse<void>> {
        let response;
        const user = await UserService.getInstance().getUserByToken(data.token);

        if (user) {
            KIXObjectCache.updateCache(KIXObjectType.CURRENT_USER, null, ServiceMethod.UPDATE);
            await UserService.getInstance().setPreferences(data.token, data.parameter, user.UserID)
                .then(() => {
                    response = new CommunicatorResponse(
                        AgentEvent.SET_PREFERENCES_FINISHED, new SetPreferencesResponse(data.requestId)
                    );
                }).catch((error) => {
                    LoggingService.getInstance().error(error.Code + ' - ' + error.Message);
                    response = new CommunicatorResponse(
                        AgentEvent.SET_PREFERENCES_ERROR, error
                    );
                });
            return response;
        }
    }

    private async getCurrentUser(data: GetCurrentUserRequest): Promise<CommunicatorResponse<User>> {
        let response;
        await UserService.getInstance().getUserByToken(data.token, data.cache)
            .then((currentUser: User) => {
                response = new CommunicatorResponse(
                    AgentEvent.GET_CURRENT_USER_FINISHED, new GetCurrentUserResponse(data.requestId, currentUser)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(error.Code + ' - ' + error.Message);
                response = new CommunicatorResponse(
                    AgentEvent.GET_CURRENT_USER_ERROR, error
                );
            });
        return response;
    }
}
