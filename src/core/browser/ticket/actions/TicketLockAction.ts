import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { Ticket, KIXObjectType, TicketProperty, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { TicketDetailsContext } from '../context';
import { BrowserUtil } from '../../BrowserUtil';
import { ApplicationEvent } from '../../application/ApplicationEvent';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CacheService } from '../../cache';

export class TicketLockAction extends AbstractAction<Ticket> {

    public permissions = [
        new UIComponentPermission('tickets/*', [CRUD.UPDATE])
    ];

    private currentLockId: number;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Lock';
        this.icon = 'kix-icon-lock-close';
    }

    public async setData(ticket: Ticket): Promise<void> {
        this.data = ticket;

        this.text = ticket.LockID === 1 ? 'Translatable#Lock' : 'Translatable#Unlock';
        this.icon = ticket.LockID === 1 ? 'kix-icon-lock-close' : 'kix-icon-lock-open';
        this.currentLockId = ticket.LockID;
    }

    public async run(): Promise<void> {
        let successHint = 'Translatable#Ticket locked.';

        let newLockId = 1;
        if (this.currentLockId === 1) {
            newLockId = 2;
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Lock Ticket ...' }
            );
        } else {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Unlock Ticket ...' }
            );
            successHint = 'Translatable#Ticket unlocked.';
        }

        await KIXObjectService.updateObject(
            KIXObjectType.TICKET, [[TicketProperty.LOCK_ID, newLockId]], this.data.TicketID,
        ).catch((error) => null);

        setTimeout(async () => {
            const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
            await context.getObject(KIXObjectType.TICKET, true);
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
            BrowserUtil.openSuccessOverlay(successHint);

            await CacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
            EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR);
        }, 500);
    }

}
