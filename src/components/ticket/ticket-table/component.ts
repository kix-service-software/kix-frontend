import { TicketService, TicketUtil } from '@kix/core/dist/browser/ticket';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { TicketProperty, Ticket } from '@kix/core/dist/model/';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { SortOrder } from '@kix/core/dist/model';
import { TicketTableComponentState } from './TicketTableComponentState';

export class TicketTableComponent {

    private state: TicketTableComponentState;

    public onCreate(input: any): void {
        this.state = new TicketTableComponentState();
    }

    public onMount(): void {
        //
    }

    public async onInput(input: any): Promise<void> {
        const th = await TranslationHandler.getInstance();

        if (input.properties) {
            this.state.properties = input.properties.map((sp) => [sp, th.getTranslation(sp)]);
        }
        this.state.tickets = input.tickets;
        this.state.displayLimit = input.displayLimit;
    }

    private ticketClicked(ticketId: string, event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        ComponentRouterStore.getInstance().navigate('base-router', 'ticket-details', { ticketId }, ticketId);
    }

    private sortUp(property: TicketProperty): void {
        this.state.tickets = TicketUtil.sortTickets(SortOrder.UP, this.state.tickets, property);
        (this as any).setStateDirty('tickets');
    }

    private sortDown(property: TicketProperty): void {
        this.state.tickets = TicketUtil.sortTickets(SortOrder.DOWN, this.state.tickets, property);
        (this as any).setStateDirty('tickets');
    }
}

module.exports = TicketTableComponent;
