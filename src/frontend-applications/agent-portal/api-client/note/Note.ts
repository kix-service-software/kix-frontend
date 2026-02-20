/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { APIClient } from '../APIClient';

export class NoteAPIClient extends APIClient {

    public static async loadNotes(): Promise<any> {
        const response = await this.executeRequest(RequestMethod.GET, '/notes');
        const result = await response.json();
        return result.notes;
    }

    public static async saveNotes(contextId: string, notes: string): Promise<void> {
        const body = { contextId, notes };
        await this.executeRequest(RequestMethod.POST, '/notes', body);
    }
}