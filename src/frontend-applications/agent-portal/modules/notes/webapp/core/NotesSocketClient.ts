/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../modules/base-components/webapp/core/SocketClient';
import { ClientStorageService } from '../../../../modules/base-components/webapp/core/ClientStorageService';
import { NotesEvent } from '../../model/NotesEvent';
import { IdService } from '../../../../model/IdService';
import { LoadNotesResponse } from '../../model/LoadNotesResponse';
import { SocketEvent } from '../../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../../modules/base-components/webapp/core/SocketErrorResponse';
import { ISocketRequest } from '../../../../modules/base-components/webapp/core/ISocketRequest';
import { SaveNotesRequest } from '../../model/SaveNotesRequest';
import { ISocketResponse } from '../../../../modules/base-components/webapp/core/ISocketResponse';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';

export class NotesSocketClient extends SocketClient {

    public static getInstance(): NotesSocketClient {
        if (!NotesSocketClient.INSTANCE) {
            NotesSocketClient.INSTANCE = new NotesSocketClient();
        }

        return NotesSocketClient.INSTANCE;
    }

    private static INSTANCE: NotesSocketClient = null;

    private constructor() {
        super('notes');
    }

    public async loadNotes(): Promise<any> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<string>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + NotesEvent.LOAD_NOTES);
            }, socketTimeout);

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
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(NotesEvent.LOAD_NOTES, request);
        });
    }

    public async saveNotes(contextId: string, notes: string): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            const request = new SaveNotesRequest(
                requestId, ClientStorageService.getClientRequestId(), contextId, notes
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + NotesEvent.SAVE_NOTES);
            }, socketTimeout);

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
