import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";
import { TicketProperty } from "@kix/core/dist/model";
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";
import { TicketSearchState } from './TicketSearchState';
import { TranslationHandler } from "@kix/core/dist/browser/TranslationHandler";

class TicketSearchComponent {

    public state: TicketSearchState;

    public onCreate(input: any): void {
        this.state = new TicketSearchState();
    }

    public async onMount(): Promise<void> {
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));

        const th = await TranslationHandler.getInstance();
        this.state.ticketProperties = Object.keys(TicketProperty).map(
            (key) => [TicketProperty[key], th.getTranslation(key)]
        ) as Array<[string, string]>;
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
        TicketStore.getInstance().prepareSearch('ticket-search', [attributeId, null, null, null]);
        this.setComponentDirty();
    }

    private isPropertySelected(property: string): boolean {
        return this.state.properties.findIndex((p) => p === property) > -1;
    }

    private ticketPropertiesChanged(event: any): void {
        const selectedProperties: string[] = [];
        for (const selectedProperty of event.target.selectedOptions) {
            selectedProperties.push(selectedProperty.value);
        }
        this.state.properties = selectedProperties;
    }

    private attributeChanged(attributeId: string, attribute: [TicketProperty, SearchOperator, string[]]): void {
        const idx = this.state.searchAttributes.findIndex((sa) => sa[0] === attributeId);
        this.state.searchAttributes[idx][1] = attribute[0];
        this.state.searchAttributes[idx][2] = attribute[1];
        this.state.searchAttributes[idx][3] = attribute[2];

        TicketStore.getInstance().prepareSearch(
            'ticket-search', [attributeId, attribute[0], attribute[1], attribute[2], attribute[3]]
        );

        this.setComponentDirty();
    }

    private async searchTickets(): Promise<void> {
        this.state.searching = true;
        this.state.tickets = [];

        const start = Date.now();
        TicketStore.getInstance().searchTickets('ticket-search', this.state.limit, this.state.properties).then(() => {
            const end = Date.now();
            this.state.time = (end - start) / 1000;
            this.state.searching = false;
            this.state.error = null;
        }).catch(() => {
            this.state.error = TicketStore.getInstance().getTicketsSearchError('ticket-search');
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
        this.state.canSearch = (
            (attributes.length > 0) &&
            (attributes.filter((sa) => !sa[1]).length === 0) &&
            (attributes.filter((sa) => sa[3].length === 0).length === 0)
        );

        if (!this.state.canSearch) {
            this.state.error = "Suche muss vollstänidg ausgefüllt werden!";
        } else {
            this.state.error = null;
        }

        (this as any).setStateDirty('searchFilter');
    }

}

module.exports = TicketSearchComponent;
