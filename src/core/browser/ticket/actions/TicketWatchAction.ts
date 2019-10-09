/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { Ticket, KIXObjectType, CreateTicketWatcherOptions, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { TicketDetailsContext } from '../context';
import { BrowserUtil } from '../../BrowserUtil';
import { ApplicationEvent } from '../../application';
import { AgentService } from '../../application/AgentService';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CacheService } from '../../cache';

export class TicketWatchAction extends AbstractAction<Ticket> {

    public hasLink: boolean = false;
    private watcherId: number;

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.READ]),
        new UIComponentPermission('watchers', [CRUD.CREATE]),
        new UIComponentPermission('watchers/*', [CRUD.DELETE])
    ];

    private isWatching: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Watch';
        this.icon = 'kix-icon-eye';
    }

    public async setData(ticket: Ticket): Promise<void> {
        this.data = ticket;

        const currentUser = await AgentService.getInstance().getCurrentUser();
        const watcher = ticket.Watchers.find((w) => w.UserID === currentUser.UserID);

        if (ticket.Watchers && watcher) {
            this.isWatching = true;
            this.text = 'Translatable#Unwatch';
            this.icon = 'kix-icon-eye-off';
            this.watcherId = watcher.ID;
        } else {
            this.isWatching = false;
            this.text = 'Translatable#Watch';
            this.icon = 'kix-icon-eye';
        }
    }

    public async run(): Promise<void> {
        let successHint: string;

        const currentUser = await AgentService.getInstance().getCurrentUser();

        if (this.isWatching) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Unwatch Ticket'
            });

            const failIds = await KIXObjectService.deleteObject(KIXObjectType.WATCHER, [this.watcherId]);
            if (!failIds || !!!failIds.length) {
                successHint = 'Translatable#Ticket is no longer watched.';
            }
        } else {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Watch Ticket' }
            );

            const watcherId = await KIXObjectService.createObject(
                KIXObjectType.WATCHER, [['UserID', currentUser.UserID]],
                new CreateTicketWatcherOptions(this.data.TicketID, currentUser.UserID)
            );
            if (watcherId) {
                successHint = 'Translatable#Ticket is being watched.';
            }
        }

        setTimeout(async () => {
            if (successHint) {
                const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
                await context.getObject(KIXObjectType.TICKET, true);
                BrowserUtil.openSuccessOverlay(successHint);
            }

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });

            CacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
            EventService.getInstance().publish(ApplicationEvent.REFRESH);

        }, 1000);
    }

}
