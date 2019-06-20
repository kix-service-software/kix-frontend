import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { TicketDialogUtil } from '../../ticket';

export class ContactCreateTicketAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Ticket';
        this.icon = 'kix-icon-new-ticket';
    }

    public async run(event: any): Promise<void> {
        TicketDialogUtil.createTicket();
    }

}
