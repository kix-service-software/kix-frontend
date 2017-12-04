import { TicketsComponentState } from './model/TicketsComponentState';
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';

class TicketsComponent {

    public state: TicketsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new TicketsComponentState();
    }

    public onInput(input: any) {
        this.state.ticketId = input.objectId;
    }

    public onMount(): void {
        if (this.state.ticketId) {
            KIXRouterStore.getInstance().navigate(
                'base-router', 'ticket-details', { ticketId: this.state.ticketId }
            );
        }
    }
}

module.exports = TicketsComponent;
