import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { TicketProperty } from "@kix/core/dist/model/";
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';
import { TicketService } from "@kix/core/dist/browser/ticket/TicketService";

class TicketSearchComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            properties: [],
            ticketProperties: []
        };
    }

    public async onMount(): Promise<void> {
        TicketService.getInstance().addStateListener('ticket-search', this.ticketStateChanged.bind(this));

        const th = await TranslationHandler.getInstance();
        this.state.ticketProperties = Object.keys(TicketProperty).map(
            (key) => [TicketProperty[key], th.getTranslation(key)]
        ) as Array<[string, string]>;
        this.state.ticketProperties = this.state.ticketProperties.sort((a, b) => a[1].localeCompare(b[1]));

        this.openSearchDialog();
    }

    private openSearchDialog(): void {
        ApplicationStore.getInstance().toggleDialog(
            'ticket-search-dialog-content', { properties: this.state.properties }
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
        TicketService.getInstance().prepareSearchProperties('ticket-search', selectedProperties);
    }

    private ticketStateChanged(): void {
        const properties = TicketService.getInstance().getTicketsSearchProperties('ticket-search');
        this.state.properties = properties ? properties : [];
    }

}

module.exports = TicketSearchComponent;
