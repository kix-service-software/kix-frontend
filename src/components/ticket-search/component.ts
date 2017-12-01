import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { TicketProperty } from "@kix/core/dist/model/ticket/TicketProperty";
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';

class TicketSearchComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            properties: [
                TicketProperty.TICKET_NUMBER,
                TicketProperty.TITLE
            ],
            ticketProperties: []
        };
    }

    public async onMount(): Promise<void> {
        this.openSearchDialog();
        const th = await TranslationHandler.getInstance();
        this.state.ticketProperties = Object.keys(TicketProperty).map(
            (key) => [TicketProperty[key], th.getTranslation(key)]
        ) as Array<[string, string]>;
        this.state.ticketProperties = this.state.ticketProperties.sort((a, b) => a[1].localeCompare(b[1]));
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
        this.state.properties = selectedProperties;
    }

}

module.exports = TicketSearchComponent;
