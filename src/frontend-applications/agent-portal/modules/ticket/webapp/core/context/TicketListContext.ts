/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../model/Ticket';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TicketProperty } from '../../../model/TicketProperty';

export class TicketListContext extends Context {

    public static CONTEXT_ID: string = 'ticket-list';

    public getIcon(): string | ObjectIcon {
        return this.icon || 'kix-icon-ticket';
    }

    public async loadTickets(limit?: number): Promise<void> {
        const ticketStatsProperty = this.getAdditionalInformation('TicketStatsProperty');

        const loadingOptions = new KIXObjectLoadingOptions(null, null, limit);
        loadingOptions.includes = [TicketProperty.WATCHERS, TicketProperty.STATE_TYPE, TicketProperty.UNSEEN];
        loadingOptions.limit = limit;

        await this.prepareContextLoadingOptions(KIXObjectType.TICKET, loadingOptions);
        loadingOptions.query = [['Counter', ticketStatsProperty]];

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.USER_TICKETS, null, loadingOptions, null, false, undefined, undefined,
            this.contextId + KIXObjectType.TICKET
        ).catch(() => []);

        await this.getUrl();
        this.setObjectList(KIXObjectType.TICKET, tickets);
    }

    public async reloadObjectList(
        objectType: KIXObjectType | string, silent: boolean = false, limit?: number
    ): Promise<void> {
        if (objectType === KIXObjectType.TICKET) {
            return this.loadTickets(limit);
        } else {
            return super.reloadObjectList(objectType, silent, limit);
        }
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        await this.handleURLParams(urlParams);
    }

    private async handleURLParams(urlParams: URLSearchParams): Promise<void> {
        if (urlParams) {
            this.setAdditionalInformation('TicketStatsProperty', urlParams.has('list'));
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor?.urlPaths) && this.descriptor?.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            const ticketStatsProperty = this.getAdditionalInformation('TicketStatsProperty');
            if (ticketStatsProperty) {
                params.push(`list=${encodeURIComponent(ticketStatsProperty)}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async setTicketList(title: string, history: boolean = true): Promise<void> {

        EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);

        if (history) {
            ContextService.getInstance().setDocumentHistory(true, this, this, null);
        }

        const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
        if (isStored) {
            ContextService.getInstance().updateStorage(this.instanceId);
        }
    }

}
