import { TicketsComponentState } from './TicketsComponentState';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { BreadcrumbDetails, Context } from '@kix/core/dist/model/';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';

class TicketsComponent {

    public state: TicketsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketsComponentState();
    }

    public onInput(input: any) {
        this.state.ticketId = input.objectId;
    }

    public onMount(): void {
        if (this.state.ticketId) {
            ComponentRouterService.getInstance().navigate(
                'base-router', 'ticket-details', { ticketId: this.state.ticketId }, this.state.ticketId
            );
        }
    }
}

module.exports = TicketsComponent;
