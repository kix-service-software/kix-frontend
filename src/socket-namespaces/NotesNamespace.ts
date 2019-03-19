import { SocketNameSpace } from './SocketNameSpace';
import {
    NotesEvent, LoadNotesRequest, LoadNotesResponse, SaveNotesRequest
} from '../core/model';
import { SocketResponse } from '../core/common';
import { ConfigurationService, UserService } from '../core/services';

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

        const notes = await ConfigurationService.getInstance().getComponentConfiguration(
            'notes', data.contextId, userId
        );

        const response = new LoadNotesResponse(data.requestId, notes);
        return new SocketResponse(NotesEvent.NOTES_LOADED, response);
    }

    private async saveNotes(data: SaveNotesRequest): Promise<SocketResponse<void>> {
        let userId = null;
        if (data.token) {
            const user = await UserService.getInstance().getUserByToken(data.token);
            userId = user.UserID;
        }

        let notesConfig = await ConfigurationService.getInstance().getModuleConfiguration('notes', userId);
        if (!notesConfig) {
            notesConfig = {};
        }
        notesConfig[data.contextId] = data.notes;

        let response;
        await ConfigurationService.getInstance().saveModuleConfiguration('notes', userId, notesConfig)
            .then(() => {
                response = new SocketResponse(NotesEvent.SAVE_NOTES_FINISHED);
            }).catch((error) => {
                response = new SocketResponse(NotesEvent.SAVE_NOTES_ERROR, error.message);
            });

        return response;

    }
}
