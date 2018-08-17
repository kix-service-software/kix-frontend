import { KIXCommunicator } from './KIXCommunicator';
import {
    NotesEvent,
    LoadNotesRequest,
    LoadNotesResponse,
    SaveNotesRequest
} from '@kix/core/dist/model';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class NotesCommunicatior extends KIXCommunicator {

    protected getNamespace(): string {
        return 'notes';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, NotesEvent.LOAD_NOTES, this.loadNotes.bind(this));
        this.registerEventHandler(client, NotesEvent.SAVE_NOTES, this.saveNotes.bind(this));
    }

    private async loadNotes(data: LoadNotesRequest): Promise<CommunicatorResponse<LoadNotesResponse>> {
        let userId = null;
        if (data.token) {
            const user = await this.userService.getUserByToken(data.token);
            userId = user.UserID;
        }

        const notes = await this.configurationService.getComponentConfiguration('notes', data.contextId, userId);

        const response = new LoadNotesResponse(data.requestId, notes);
        return new CommunicatorResponse(NotesEvent.NOTES_LOADED, response);
    }

    private async saveNotes(data: SaveNotesRequest): Promise<CommunicatorResponse<void>> {
        let userId = null;
        if (data.token) {
            const user = await this.userService.getUserByToken(data.token);
            userId = user.UserID;
        }

        let notesConfig = await this.configurationService.getModuleConfiguration('notes', userId);
        if (!notesConfig) {
            notesConfig = {};
        }
        notesConfig[data.contextId] = data.notes;

        let response;
        await this.configurationService.saveModuleConfiguration('notes', userId, notesConfig)
            .then(() => {
                response = new CommunicatorResponse(NotesEvent.SAVE_NOTES_FINISHED);
            }).catch((error) => {
                response = new CommunicatorResponse(NotesEvent.SAVE_NOTES_ERROR, error.message);
            });

        return response;

    }
}
