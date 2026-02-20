import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ApplicationEvent } from '../../modules/base-components/webapp/core/ApplicationEvent';
import { BrowserCacheService } from '../../modules/base-components/webapp/core/CacheService';
import { EventService } from '../../modules/base-components/webapp/core/EventService';
import { Webform } from '../../modules/webform/model/Webform';
import { APIClient } from '../APIClient';

export class WebformAPIClient extends APIClient {

    public static async loadWebforms(): Promise<Webform[]> {
        const response = await this.executeRequest(RequestMethod.GET, '/webforms');
        const result = await response.json();
        return result.webforms.map((wf) => new Webform(wf));
    }

    public static async createUpdateWebform(webform: Webform, webformId?: number): Promise<number> {
        const body = { webform, webformId };

        const response = await this.executeRequest(RequestMethod.POST, '/webforms', { webform, webformId });
        const result = await response.json();
        const objectId = Number(result.id);

        EventService.getInstance().publish(
            ApplicationEvent.OBJECT_UPDATED, { objectType: KIXObjectType.WEBFORM }
        );

        return objectId;
    }

    public static async deleteWebform(formId?: number): Promise<void> {
        await this.executeRequest(RequestMethod.DELETE, `/webforms/${formId}`);
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.WEBFORM);
        EventService.getInstance().publish(
            ApplicationEvent.OBJECT_DELETED, { objectType: KIXObjectType.WEBFORM }
        );
    }

}