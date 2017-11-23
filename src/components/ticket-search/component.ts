import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";
import { TicketProperty } from "@kix/core/dist/model";
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";
import { TicketSearchState } from './TicketSearchState';

class TicketSearchComponent {

    public state: TicketSearchState;

    public onCreate(input: any): void {
        this.state = new TicketSearchState();
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
    }

    private limitChanged(event: any): void {
        this.state.limit = event.target.value;
    }

    private addSearchAttribute(event: any): void {
        const id = Date.now();
        this.state.searchAttributes.push(['attribute-' + id, null, SearchOperator.CONTAINS, ['*']]);
        this.setComponentDirty();
    }

    private deletSearchAtribute(attributeId: string) {
        const idx = this.state.searchAttributes.findIndex((sa) => sa[0] === attributeId);
        if (idx > -1) {
            this.state.searchAttributes.splice(idx, 1);
        }
        this.setComponentDirty();
    }

    private attributeChanged(attributeId: string, attribute: [TicketProperty, SearchOperator, string[]]): void {
        const idx = this.state.searchAttributes.findIndex((sa) => sa[0] === attributeId);
        this.state.searchAttributes[idx][1] = attribute[0];
        this.state.searchAttributes[idx][2] = attribute[1];
        this.state.searchAttributes[idx][3] = attribute[2];
        this.setComponentDirty();
    }

    private searchTickets(): void {
        this.state.searching = true;
        this.state.tickets = [];

        const properties = [
            TicketProperty.TICKET_ID,
            TicketProperty.TICKET_NUMBER,
            TicketProperty.TITLE
        ];

        for (const attribute of this.state.searchAttributes) {
            TicketStore.getInstance().prepareSearch('ticket-search', [attribute[1], attribute[2], attribute[3]]);
        }

        const start = Date.now();
        TicketStore.getInstance().searchTickets('ticket-search', this.state.limit, properties).then(() => {
            const end = Date.now();
            this.state.time = (end - start) / 1000;
            this.state.searching = false;
        });
    }

    private ticketStateChanged(): void {
        const result = TicketStore.getInstance().getTicketsSearchResult('ticket-search');
        if (result) {
            this.state.tickets = result;
        }
    }

    private setComponentDirty(): void {
        const attributes = this.state.searchAttributes;
        this.state.canSearch = (attributes.length > 0) && (attributes.filter((sa) => !sa[1]).length === 0);
        (this as any).setStateDirty('searchFilter');
    }

}

module.exports = TicketSearchComponent;
