/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { NotesEvent } from '../model/NotesEvent';
import { ISocketRequest } from '../../../modules/base-components/webapp/core/ISocketRequest';
import { SocketResponse } from '../../../modules/base-components/webapp/core/SocketResponse';
import { LoadNotesResponse } from '../model/LoadNotesResponse';
import { UserService } from '../../user/server/UserService';
import { User } from '../../user/model/User';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { SaveNotesRequest } from '../model/SaveNotesRequest';
import { SocketEvent } from '../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../modules/base-components/webapp/core/SocketErrorResponse';

import cookie from 'cookie';
import { Socket } from 'socket.io';

export class NotesNamespace extends SocketNameSpace {

    private static INSTANCE: NotesNamespace;

    public static getInstance(): NotesNamespace {
        if (!NotesNamespace.INSTANCE) {
            NotesNamespace.INSTANCE = new NotesNamespace();
        }
        return NotesNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'notes';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, NotesEvent.LOAD_NOTES, this.loadNotes.bind(this));
        this.registerEventHandler(client, NotesEvent.SAVE_NOTES, this.saveNotes.bind(this));
    }

    private async loadNotes(
        data: ISocketRequest, client: Socket
    ): Promise<SocketResponse<LoadNotesResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);

        let notes = {};
        if (user) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + '_notes';

            const notesPreference = user.Preferences.find((p) => p.ID === preferenceId);

            if (notesPreference) {
                notes = JSON.parse(notesPreference.Value);
            }
        }

        const response = new LoadNotesResponse(data.requestId, notes);
        return new SocketResponse(NotesEvent.NOTES_LOADED, response);
    }

    private async saveNotes(data: SaveNotesRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        if (token) {
            const user = await UserService.getInstance().getUserByToken(token)
                .catch((): User => null);

            if (user) {
                const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
                const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + '_notes';

                const notesPreference = user.Preferences.find((p) => p.ID === preferenceId);
                let notesConfig = {};
                if (notesPreference) {
                    notesConfig = JSON.parse(notesPreference.Value);
                }

                notesConfig[data.contextId] = data.notes;
                const value = JSON.stringify(notesConfig);

                UserService.getInstance().setPreferences(token, 'NotesNamespace', [[preferenceId, value]])
                    .catch((error: Error) => {
                        return new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error));
                    });

                return new SocketResponse(NotesEvent.SAVE_NOTES_FINISHED, { requestId: data.requestId });
            } else {
                return new SocketResponse(
                    SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user available.')
                );
            }
        }
    }
}
