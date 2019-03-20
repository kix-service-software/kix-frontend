import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { Ticket, KIXObjectType, CreateTicketWatcherOptions, DeleteTicketWatcherOptions } from '../../../model';
import { ContextService } from '../../context';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { TicketDetailsContext } from '../context';
import { BrowserUtil } from '../../BrowserUtil';
import { ApplicationEvent } from '../../application';
import { ObjectDataService } from '../../ObjectDataService';

export class TicketWatchAction extends AbstractAction<Ticket> {

    private isWatching: boolean = false;
    private userId: number = null;

    public initAction(): void {
        this.text = 'Translatable#Watch';
        this.icon = 'kix-icon-eye';

        const objectData = ObjectDataService.getInstance().getObjectData();
        this.userId = objectData.currentUser.UserID;
    }

    public setData(ticket: Ticket): void {
        this.data = ticket;

        if (ticket.Watchers && ticket.Watchers.some((w) => w.UserID === this.userId)) {
            this.isWatching = true;
            this.text = 'Translatable#Unwatch';
            this.icon = 'kix-icon-eye-off';
        } else {
            this.isWatching = false;
            this.text = 'Translatable#Watch';
            this.icon = 'kix-icon-eye';
        }
    }

    public async run(): Promise<void> {
        let successHint: string;
        if (this.isWatching) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Unwatch Ticket ...'
            });

            const failIds = await KIXObjectService.deleteObject(
                KIXObjectType.WATCHER, [this.data.TicketID], new DeleteTicketWatcherOptions(this.userId)
            );
            if (!failIds || !!!failIds.length) {
                successHint = 'Translatable#Ticket is no longer watched.';
            }
        } else {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Watch Ticket ...' }
            );

            const watcherId = await KIXObjectService.createObject(
                KIXObjectType.WATCHER, [['UserID', this.userId]],
                new CreateTicketWatcherOptions(this.data.TicketID, this.userId)
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

        }, 1000);
    }

}
