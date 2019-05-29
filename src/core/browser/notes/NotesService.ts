import { NotesSocketClient } from "./NotesSocketClient";

export class NotesService {

    private static INSTANCE: NotesService = null;

    public static getInstance(): NotesService {
        if (!NotesService.INSTANCE) {
            NotesService.INSTANCE = new NotesService();
        }

        return NotesService.INSTANCE;
    }

    private constructor() { }

    public async loadNotes(contextId: string): Promise<string> {
        return await NotesSocketClient.getInstance().loadNotes(contextId);
    }

    public async saveNotes(contextId: string, notes: string): Promise<void> {
        await NotesSocketClient.getInstance().saveNotes(contextId, notes);
    }
}
