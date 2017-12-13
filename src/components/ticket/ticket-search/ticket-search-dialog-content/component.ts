import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { TicketProperty } from "@kix/core/dist/model/";
import { TicketSearchState } from './TicketSearchState';
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";

export class TicketSearchDialogComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = new TicketSearchState();
    }

    public async onMount(): Promise<void> {
        TicketStore.getInstance().loadTicketData('ticket-search');

        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));

        this.ticketStateChanged();

        this.setComponentDirty();
    }

    private ticketStateChanged(): void {
        const searchFilter = TicketStore.getInstance().getTicketSearchFilter('ticket-search');
        if (searchFilter) {
            this.state.searchAttributes = searchFilter;
        }

        this.state.properties = TicketStore.getInstance().getTicketsSearchProperties('ticket-search');
        this.setComponentDirty();
    }

    private limitChanged(event: any): void {
        this.state.limit = event.target.value;
    }

    private addSearchAttribute(event: any): void {
        const attributeId = 'attribute-' + Date.now();
        const attribute: [string, TicketProperty, SearchOperator, any] = [attributeId, null, null, null];

        TicketStore.getInstance().prepareSearch('ticket-search', attribute);
    }

    private deletSearchAtribute(attributeId: string) {
        TicketStore.getInstance().prepareSearch('ticket-search', [attributeId, null, null, null]);
    }

    private attributeChanged(
        attributeId: string,
        attribute: [TicketProperty, SearchOperator, string | number | number[] | string[]]
    ): void {
        TicketStore.getInstance().prepareSearch(
            'ticket-search', [attributeId, attribute[0], attribute[1], attribute[2], attribute[3]]
        );
    }

    private async searchTickets(): Promise<void> {
        this.state.searching = true;

        TicketStore.getInstance().searchTickets('ticket-search', this.state.limit, this.state.properties).then(() => {
            this.state.searching = false;
            this.state.error = null;
            ApplicationStore.getInstance().toggleDialog();
        }).catch(() => {
            this.state.error = TicketStore.getInstance().getTicketsSearchError('ticket-search');
            this.state.searching = false;
        });
    }

    private setComponentDirty(): void {
        const attributes = this.state.searchAttributes;
        this.state.canSearch = (
            (attributes.length > 0) &&
            (attributes.filter((sa) => !sa[1]).length === 0)
        );

        if (!this.state.canSearch) {
            this.state.error = "Suche muss vollstänidg ausgefüllt werden!";
        } else {
            this.state.error = null;
        }

        (this as any).setStateDirty('searchAttributes');
    }

}

module.exports = TicketSearchDialogComponent;
