import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { APIClient } from '../APIClient';

export class ConfigAPIClient extends APIClient {

    public static async rebuildConfiguration(): Promise<void> {
        await this.executeRequest(RequestMethod.POST, '/config');
    }

}