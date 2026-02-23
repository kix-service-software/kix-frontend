/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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