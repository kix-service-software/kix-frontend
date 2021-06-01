/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { Ticket } from '../../../model/Ticket';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { BreadcrumbInformation } from '../../../../../model/BreadcrumbInformation';
import { TicketContext } from './TicketContext';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { TicketProperty } from '../../../model/TicketProperty';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { Article } from '../../../model/Article';
import { ArticleLoadingOptions } from '../../../model/ArticleLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

export class TicketDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-details';

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<Ticket>(), true, !short);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        let object: O;
        let ticket;

        if (!objectType) {
            objectType = KIXObjectType.TICKET;
        }

        ticket = await this.loadTicket(changedProperties);

        if (objectType === KIXObjectType.TICKET) {
            object = ticket;
        } else if (objectType === KIXObjectType.ORGANISATION && ticket) {
            if (!isNaN(ticket.OrganisationID)) {
                const organisations = await KIXObjectService.loadObjects(
                    KIXObjectType.ORGANISATION, [ticket.OrganisationID]
                ).catch(() => []);
                object = organisations && organisations.length ? organisations[0] : null;
            }
        } else if (objectType === KIXObjectType.CONTACT && ticket) {
            if (!isNaN(ticket.ContactID)) {
                const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, [ticket.ContactID])
                    .catch(() => []);
                object = contacts && contacts.length ? contacts[0] : null;
            }
        }

        if (reload && objectType === KIXObjectType.TICKET) {
            this.listeners.forEach((l) => l.objectListChanged(KIXObjectType.ARTICLE, []));
            setTimeout(() => {
                this.listeners.forEach(
                    (l) => l.objectChanged(Number(this.objectId), ticket, KIXObjectType.TICKET, changedProperties)
                );
            }, 100);
        }

        return object;
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Ticket>();
        const text = await LabelService.getInstance().getObjectText(object);
        return new BreadcrumbInformation(this.getIcon(), [TicketContext.CONTEXT_ID], text);
    }

    private async loadTicket(changedProperties: string[] = [], cache: boolean = true): Promise<Ticket> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, ['StateType', 'ObjectActions', KIXObjectProperty.DYNAMIC_FIELDS, TicketProperty.WATCHERS]
        );

        const ticket: Ticket = await this.loadDetailsObject<Ticket>(KIXObjectType.TICKET, loadingOptions);
        return ticket;
    }

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType | string): Promise<T[]> {
        let objects = [];
        if (objectType === KIXObjectType.ARTICLE) {
            objects = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, null,
                new KIXObjectLoadingOptions(
                    null, null, null, [ArticleProperty.ATTACHMENTS, ArticleProperty.FLAGS, 'ObjectActions']
                ), new ArticleLoadingOptions(this.objectId)
            ).catch(() => [] as Article[]) || [];
        } else if (objectType === KIXObjectType.TICKET_HISTORY) {
            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [this.objectId],
                new KIXObjectLoadingOptions(null, null, null, [TicketProperty.HISTORY])
            );
            if (Array.isArray(tickets) && tickets.length) {
                objects = Array.isArray(tickets[0].History) ? tickets[0].History : [];
            }
        } else {
            objects = await super.getObjectList(objectType);
        }

        return objects;
    }
}
