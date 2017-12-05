import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { TicketProperty, Ticket } from '@kix/core/dist/model/';
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';

export class TicketTableComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            tickets: [],
            properties: [],
            displayLimit: 10
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        if (!TicketStore.getInstance().getTicketData('ticket-table-data')) {
            TicketStore.getInstance().loadTicketData('ticket-table-data');
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
        if (TicketStore.getInstance().getTicketData('ticket-table-data')) {
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
        KIXRouterStore.getInstance().navigate('base-router', 'ticket-details', { ticketId }, true, ticketId);
    }
}

module.exports = TicketTableComponent;
