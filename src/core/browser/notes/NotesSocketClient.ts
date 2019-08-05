/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "../SocketClient";
import {
    NotesEvent, LoadNotesResponse, SaveNotesRequest, ISocketResponse, SocketEvent, ISocketRequest
} from "../../model";
import { ClientStorageService } from "../ClientStorageService";
import { IdService } from "../IdService";
import { SocketErrorResponse } from "../../common";

export class NotesSocketClient extends SocketClient {

    public static getInstance(): NotesSocketClient {
        if (!NotesSocketClient.INSTANCE) {
            NotesSocketClient.INSTANCE = new NotesSocketClient();
        }

        return NotesSocketClient.INSTANCE;
    }

    private static INSTANCE: NotesSocketClient = null;

    private constructor() {
        super();
        this.socket = this.createSocket('notes', true);
    }

    public loadNotes(): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + NotesEvent.LOAD_NOTES);
            }, 30000);

            const requestId = IdService.generateDateBasedId('notes-');

            this.socket.on(NotesEvent.NOTES_LOADED, (result: LoadNotesResponse) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.notes);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token,
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(NotesEvent.LOAD_NOTES, request);
        });
    }

    public saveNotes(contextId: string, notes: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const request = new SaveNotesRequest(
                token, requestId, ClientStorageService.getClientRequestId(), contextId, notes
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + NotesEvent.SAVE_NOTES);
            }, 30000);

            this.socket.on(NotesEvent.SAVE_NOTES_FINISHED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(NotesEvent.SAVE_NOTES, request);
        });
    }

}
