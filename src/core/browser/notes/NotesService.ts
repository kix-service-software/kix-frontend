import { NotesSocketListener } from "./NotesSocketListener";

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
        return await NotesSocketListener.getInstance().loadNotes(contextId);
    }

    public async saveNotes(contextId: string, notes: string): Promise<void> {
        await NotesSocketListener.getInstance().saveNotes(contextId, notes);
    }
}
