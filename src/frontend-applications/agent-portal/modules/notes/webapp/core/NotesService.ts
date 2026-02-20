/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { NoteAPIClient } from '../../../../api-client/note/Note';

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
        const notes = await NoteAPIClient.loadNotes();
        return notes ? notes[contextId] : null;
    }

    public async saveNotes(contextId: string, notes: string): Promise<void> {
        await NoteAPIClient.saveNotes(contextId, notes);
    }
}
