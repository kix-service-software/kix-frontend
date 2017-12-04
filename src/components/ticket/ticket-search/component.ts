import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { TicketProperty } from "@kix/core/dist/model/";
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";

class TicketSearchComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            properties: [],
            ticketProperties: []
        };
    }

    public async onMount(): Promise<void> {
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));

        const th = await TranslationHandler.getInstance();
        this.state.ticketProperties = Object.keys(TicketProperty).map(
            (key) => [TicketProperty[key], th.getTranslation(key)]
        ) as Array<[string, string]>;
        this.state.ticketProperties = this.state.ticketProperties.sort((a, b) => a[1].localeCompare(b[1]));

        const searchResult = TicketStore.getInstance().getTicketsSearchResult('ticket-search');
        if (!searchResult) {
            this.openSearchDialog();
        }
    }

    private openSearchDialog(): void {
        ApplicationStore.getInstance().toggleDialog(
            require('./ticket-search-dialog-content'), { properties: this.state.properties }
        );
    }

    private isPropertySelected(property: string): boolean {
        return this.state.properties.findIndex((p) => p === property) > -1;
    }

    private ticketPropertiesChanged(event: any): void {
        const selectedProperties: string[] = [];
        for (const selectedProperty of event.target.selectedOptions) {
            selectedProperties.push(selectedProperty.value);
        }
        TicketStore.getInstance().prepareSearchProperties('ticket-search', selectedProperties);
    }

    private ticketStateChanged(): void {
        const properties = TicketStore.getInstance().getTicketsSearchProperties('ticket-search');
        this.state.properties = properties ? properties : [];
    }

}

module.exports = TicketSearchComponent;
