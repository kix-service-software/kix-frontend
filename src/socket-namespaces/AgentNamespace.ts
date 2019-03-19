import {
    AgentEvent, Error, PersonalSetting, SetPreferencesRequest, SetPreferencesResponse,
    GetCurrentUserRequest, User, GetCurrentUserResponse
} from '../core/model';
import { SocketResponse } from '../core/common';
import { SocketNameSpace } from './SocketNameSpace';
import { LoggingService, UserService } from '../core/services';
import { PersonalSettingsService } from '../services';

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

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, AgentEvent.GET_PERSONAL_SETTINGS, this.getPersonalSettings.bind(this));
        this.registerEventHandler(client, AgentEvent.SET_PREFERENCES, this.setPreferences.bind(this));
        this.registerEventHandler(client, AgentEvent.GET_CURRENT_USER, this.getCurrentUser.bind(this));
    }

    private async getPersonalSettings(): Promise<SocketResponse<PersonalSetting[]>> {
        let response;
        await PersonalSettingsService.getInstance().getPersonalSettings()
            .then((settings: PersonalSetting[]) => {
                response = new SocketResponse(AgentEvent.GET_PERSONAL_SETTINGS_FINISHED, settings);
            }).catch((error: Error) => {
                LoggingService.getInstance().error(error.Code + ' - ' + error.Message);
                response = new SocketResponse(AgentEvent.GET_PERSONAL_SETTINGS_ERROR, error);
            });
        return response;
    }

    private async setPreferences(data: SetPreferencesRequest, clientReqeuestId: string): Promise<SocketResponse<void>> {
        let response;
        const user = await UserService.getInstance().getUserByToken(data.token);

        if (user) {
            await UserService.getInstance().setPreferences(
                data.token, clientReqeuestId, data.parameter, user.UserID
            ).then(() => {
                response = new SocketResponse(
                    AgentEvent.SET_PREFERENCES_FINISHED, new SetPreferencesResponse(data.requestId)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(error.Code + ' - ' + error.Message);
                response = new SocketResponse(
                    AgentEvent.SET_PREFERENCES_ERROR, error
                );
            });
            return response;
        }
    }

    private async getCurrentUser(data: GetCurrentUserRequest): Promise<SocketResponse<User>> {
        let response;
        await UserService.getInstance().getUserByToken(data.token, data.cache)
            .then((currentUser: User) => {
                response = new SocketResponse(
                    AgentEvent.GET_CURRENT_USER_FINISHED, new GetCurrentUserResponse(data.requestId, currentUser)
                );
            }).catch((error) => {
                LoggingService.getInstance().error(error.Code + ' - ' + error.Message);
                response = new SocketResponse(
                    AgentEvent.GET_CURRENT_USER_ERROR, error
                );
            });
        return response;
    }
}
