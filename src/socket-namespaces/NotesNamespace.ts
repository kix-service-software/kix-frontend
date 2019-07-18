/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import {
    NotesEvent, LoadNotesRequest, LoadNotesResponse, SaveNotesRequest, SocketEvent
} from '../core/model';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { ConfigurationService } from '../core/services';
import { UserService } from '../core/services/impl/api/UserService';

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

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, NotesEvent.LOAD_NOTES, this.loadNotes.bind(this));
        this.registerEventHandler(client, NotesEvent.SAVE_NOTES, this.saveNotes.bind(this));
    }

    private async loadNotes(data: LoadNotesRequest): Promise<SocketResponse<LoadNotesResponse>> {
        let userId = null;
        if (data.token) {
            const user = await UserService.getInstance().getUserByToken(data.token);
            userId = user.UserID;
        }

        const notes = await ConfigurationService.getInstance().getConfiguration('notes', userId);

        const response = new LoadNotesResponse(data.requestId, notes);
        return new SocketResponse(NotesEvent.NOTES_LOADED, response);
    }

    private async saveNotes(data: SaveNotesRequest): Promise<SocketResponse> {
        let userId = null;
        if (data.token) {
            const user = await UserService.getInstance().getUserByToken(data.token)
                .catch(() => null);
            userId = user ? user.UserID : null;
        }

        if (userId) {
            let notesConfig = ConfigurationService.getInstance().getConfiguration('notes', userId);
            if (!notesConfig) {
                notesConfig = {};
            }
            notesConfig[data.contextId] = data.notes;


            const response = await ConfigurationService.getInstance().saveConfiguration('notes', notesConfig, userId)
                .then(() => new SocketResponse(NotesEvent.SAVE_NOTES_FINISHED, { requestId: data.requestId }))
                .catch((error) =>
                    new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error))
                );

            return response;
        } else {
            return new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user available.')
            );
        }
    }
}
