import { ComponentState } from './ComponentState';
import { TicketListContext } from '../../../core/browser/ticket';
import { ContextService } from '../../../core/browser';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context =
            await ContextService.getInstance().getContext(TicketListContext.CONTEXT_ID) as TicketListContext;
        this.state.contentWidgets = context.getContent();
    }

}

module.exports = Component;
