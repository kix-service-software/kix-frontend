import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { TicketProperty, Ticket } from '@kix/core/dist/model/';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';
import { TicketTableComponentState } from './TicketTableComponentState';

export class TicketTableComponent {

    private state: TicketTableComponentState;

    public onCreate(input: any): void {
        this.state = new TicketTableComponentState();
    }

    public onMount(): void {
        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        if (!TicketService.getInstance().getTicketData('ticket-table-data')) {
            TicketService.getInstance().loadTicketData('ticket-table-data');
        }
    }

    public async onInput(input: any): Promise<void> {
        const th = await TranslationHandler.getInstance();

        if (input.properties) {
            this.state.properties = input.properties.map((sp) => [sp, th.getTranslation(sp)]);
        }
        this.state.tickets = input.tickets;
        this.state.displayLimit = input.displayLimit;
    }

    private ticketStateChanged(): void {
        if (TicketService.getInstance().getTicketData('ticket-table-data')) {
            (this as any).setStateDirty('properties');
        }
    }

    private showMore(): void {
        let limit = this.state.displayLimit + 10;
        if (limit >= this.state.tickets.length) {
            limit = this.state.tickets.length;
        }
        this.state.displayLimit = limit;
    }

    private ticketClicked(ticketId: string, event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        ClientStorageHandler.setContextId('tickets');
        ComponentRouterStore.getInstance().navigate('base-router', 'ticket-details', { ticketId }, true, ticketId);
    }

    private sortUp(property: string): void {
        this.state.tickets = TicketService.getInstance().sortTickets(SortOrder.UP, this.state.tickets, property);
    }

    private sortDown(property: string): void {
        this.state.tickets = TicketService.getInstance().sortTickets(SortOrder.DOWN, this.state.tickets, property);
    }
}

module.exports = TicketTableComponent;
