/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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

export class TicketListContext extends Context {

    public static CONTEXT_ID: string = 'ticket-list';

    private text: string = '';
    private ticketIds: number[];

    public getIcon(): string | ObjectIcon {
        return this.icon || 'kix-icon-ticket';
    }

    public async loadTickets(ticketIds: number[] = [], text: string = ''): Promise<void> {

        this.text = text;
        this.ticketIds = ticketIds;
        const loadingOptions = new KIXObjectLoadingOptions(null, null, 1000, ['Watchers']);

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, this.ticketIds, loadingOptions, null, false
        ).catch((error) => []);

        await this.getUrl();
        this.setObjectList(KIXObjectType.TICKET, tickets);
    }

    public async reloadObjectList(objectType: KIXObjectType | string, silent: boolean = false): Promise<void> {
        this.loadTickets(this.ticketIds, this.text);
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        await this.handleURLParams(urlParams);
    }

    private async handleURLParams(urlParams: URLSearchParams): Promise<void> {
        if (urlParams) {
            await this.getActionAndSetData(decodeURIComponent(urlParams.has('list') ? urlParams.get('list') : null));
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            if (this.text) {
                params.push(`list=${encodeURIComponent(this.text)}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async setTicketList(title: string, history: boolean = true): Promise<void> {
        if (!this.text || this.text !== title) {
            this.text = title;

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

    private async getActionAndSetData(key: string): Promise<void> {
        const action = ContextService.getInstance().getToolbarAction(key);
        if (!action) return;
        this.setDisplayText(action.title);
        await this.setTicketList(action.title);
        this.setIcon(action.icon);
        await this.loadTickets(action.actionData, action?.title);
    }

}
