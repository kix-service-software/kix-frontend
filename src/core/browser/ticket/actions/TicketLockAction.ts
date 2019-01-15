import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { Ticket, KIXObjectType, TicketProperty } from '../../../model';
import { ContextService } from '../../context';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { TicketDetailsContext } from '../context';
import { LabelService } from '../../LabelService';
import { BrowserUtil } from '../../BrowserUtil';

export class TicketLockAction extends AbstractAction<Ticket> {

    private currentLockId: number;

    public initAction(): void {
        this.text = "Sperren";
        this.icon = "kix-icon-lock-close";
    }

    public setData(ticket: Ticket): void {
        this.data = ticket;

        this.text = ticket.LockID === 1 ? 'Sperren' : 'Freigeben';
        this.icon = ticket.LockID === 1 ? 'kix-icon-lock-close' : 'kix-icon-lock-open';
        this.currentLockId = ticket.LockID;
    }

    public async run(): Promise<void> {
        let successHint = 'Ticket wurde gesperrt.';

        let newLockId = 1;
        if (this.currentLockId === 1) {
            newLockId = 2;
            EventService.getInstance().publish(
                'APP_LOADING', { loading: true, hint: 'Ticket wird gesperrt ...' }
            );
        } else {
            EventService.getInstance().publish('APP_LOADING', { loading: true, hint: 'Ticket wird freigegeben ...' });
            successHint = 'Ticket wurde freigegeben.';
        }

        await KIXObjectService.updateObject(
            KIXObjectType.TICKET, [[TicketProperty.LOCK_ID, newLockId]], this.data.TicketID,
        ).catch((error) => null);

        setTimeout(async () => {
            const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
            await context.getObject(KIXObjectType.TICKET, true);
            EventService.getInstance().publish('APP_LOADING', { loading: false });
            BrowserUtil.openSuccessOverlay(successHint);
        }, 500);
    }

}
