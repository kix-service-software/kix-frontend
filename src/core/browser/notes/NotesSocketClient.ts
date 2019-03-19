import { SocketClient } from "../SocketClient";
import {
    NotesEvent,
    LoadNotesResponse,
    LoadNotesRequest,
    SaveNotesRequest
} from "../../model";
import { ClientStorageService } from "../ClientStorageService";
import { IdService } from "../IdService";

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

    public loadNotes(contextId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + NotesEvent.LOAD_NOTES);
            }, 30000);

            const requestId = IdService.generateDateBasedId('notes-');

            this.socket.on(NotesEvent.NOTES_LOADED, (result: LoadNotesResponse) => {
                window.clearTimeout(timeout);
                if (result.requestId === requestId) {
                    resolve(result.notes);
                }
            });

            this.socket.emit(
                NotesEvent.LOAD_NOTES, new LoadNotesRequest(token, requestId, contextId)
            );
        });
    }

    public saveNotes(contextId: string, notes: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const request = new SaveNotesRequest(token, contextId, notes);

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + NotesEvent.SAVE_NOTES);
            }, 30000);

            this.socket.on(NotesEvent.SAVE_NOTES_FINISHED, () => {
                window.clearTimeout(timeout);
                resolve();
            });

            this.socket.on(NotesEvent.SAVE_NOTES_ERROR, (error) => {
                window.clearTimeout(timeout);
                console.error(error);
                reject(error);
            });

            this.socket.emit(NotesEvent.SAVE_NOTES, request);
        });
    }

}
