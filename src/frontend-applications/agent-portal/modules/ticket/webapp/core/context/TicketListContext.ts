/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

        this.setObjectList(KIXObjectType.TICKET, tickets);
    }

    public async reloadObjectList(objectType: KIXObjectType | string, silent: boolean = false): Promise<void> {
        this.loadTickets(this.ticketIds, this.text);
    }

}
