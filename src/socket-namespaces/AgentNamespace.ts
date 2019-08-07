/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AgentEvent, Error, PersonalSetting, SetPreferencesRequest, SetPreferencesResponse,
    GetCurrentUserRequest, User, GetCurrentUserResponse, ISocketRequest, PersonalSettingsResponse, SocketEvent
} from '../core/model';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { SocketNameSpace } from './SocketNameSpace';
import { LoggingService } from '../core/services';
import { PersonalSettingsService } from '../services';
import { UserService } from '../core/services/impl/api/UserService';

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

    private async getPersonalSettings(data: ISocketRequest): Promise<SocketResponse> {
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

    private async setPreferences(data: SetPreferencesRequest, clientReqeuestId: string): Promise<SocketResponse> {
        const user = await UserService.getInstance().getUserByToken(data.token)
            .catch(() => null);

        if (user) {
            const response = await UserService.getInstance().setPreferences(
                data.token, clientReqeuestId, data.parameter
            ).then(() =>
                new SocketResponse(AgentEvent.SET_PREFERENCES_FINISHED, new SetPreferencesResponse(data.requestId))
            ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));
            return response;
        }

        return new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user available'));
    }

    private async getCurrentUser(data: GetCurrentUserRequest): Promise<SocketResponse> {
        const response = await UserService.getInstance().getUserByToken(data.token)
            .then((currentUser: User) =>
                new SocketResponse(
                    AgentEvent.GET_CURRENT_USER_FINISHED, new GetCurrentUserResponse(data.requestId, currentUser)
                )
            ).catch((error) => new SocketResponse(SocketEvent.ERROR, error));
        return response;
    }
}
