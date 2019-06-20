import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { Ticket, CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { TicketDialogUtil } from '../TicketDialogUtil';

export class TicketEditAction extends AbstractAction<Ticket> {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('tickets/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        TicketDialogUtil.editTicket();
    }

}
