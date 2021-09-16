/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        const token = parsedCookie ? parsedCookie.token : '';

        const user = await UserService.getInstance().getUserByToken(token)
            .catch((): User => null);

        if (user) {
            const response = await UserService.getInstance().setPreferences(
                token, data.clientRequestId, data.parameter, user.UserID
            ).then(() =>
                new SocketResponse(AgentEvent.SET_PREFERENCES_FINISHED, new SetPreferencesResponse(data.requestId))
            ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));
            return response;
        }

        return new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user available'));
    }

    private async getCurrentUser(data: GetCurrentUserRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const response = await UserService.getInstance().getUserByToken(token)
            .then((currentUser: User) =>
                new SocketResponse(
                    AgentEvent.GET_CURRENT_USER_FINISHED, new GetCurrentUserResponse(data.requestId, currentUser)
                )
            ).catch((error) => new SocketResponse(SocketEvent.ERROR, error));
        return response;
    }
}
