import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { TicketDialogUtil } from '../TicketDialogUtil';

export class TicketCreateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Ticket';
        this.icon = 'kix-icon-new-ticket';
    }

    public async run(): Promise<void> {
        TicketDialogUtil.createTicket();
    }

}
