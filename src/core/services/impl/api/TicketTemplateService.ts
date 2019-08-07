/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class TicketTemplateService extends KIXObjectService {

    private static INSTANCE: TicketTemplateService;

    public static getInstance(): TicketTemplateService {
        if (!TicketTemplateService.INSTANCE) {
            TicketTemplateService.INSTANCE = new TicketTemplateService();
        }
        return TicketTemplateService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'templates');

    public objectType: KIXObjectType = KIXObjectType.TICKET_TEMPLATE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        // let objects = [];
        // if (objectType === KIXObjectType.TICKET_TEMPLATE) {
        //     const uri = this.buildUri(this.RESOURCE_URI);
        //     const response = await this.getObjectByUri<TicketTemplatesResponse>(token, uri);
        //     const ticketTemplates = response.Template.map((t) => new TicketTemplate(t));
        //     if (objectIds && objectIds.length) {
        //         objects = ticketTemplates.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
        //     } else {
        //         objects = ticketTemplates;
        //     }
        // }

        // return objects;
        return [];
    }

}
