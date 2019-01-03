import { ITableClickListener } from '../../standard-table';
import { Ticket, KIXObjectType, ContextMode } from '../../../model';
import { ContextService } from '../../context';

export class TicketTableClickListener implements ITableClickListener<Ticket> {

    public rowClicked(ticket: Ticket, columnId: string): void {
        ContextService.getInstance().setContext(null, KIXObjectType.TICKET, ContextMode.DETAILS, ticket.TicketID);
    }

}
