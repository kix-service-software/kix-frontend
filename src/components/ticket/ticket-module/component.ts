import { ComponentState } from './ComponentState';
import { TicketContext } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(TicketContext.CONTEXT_ID) as TicketContext);
        this.state.contentWidgets = context.getContent();
    }

}

module.exports = Component;
