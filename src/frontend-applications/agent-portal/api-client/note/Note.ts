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