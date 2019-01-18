import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { TicketListContext } from '../context';

export class ShowUserTicketsAction extends AbstractAction {

    public initAction(): void {
        return;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public async run(): Promise<void> {
        const ticketIds = this.data as number[];
        const context = await ContextService.getInstance().getContext<TicketListContext>(TicketListContext.CONTEXT_ID);
        await context.loadTickets(ticketIds, this.text);
        await ContextService.getInstance().setContext(TicketListContext.CONTEXT_ID, null, null, null, null, false);
    }

}
