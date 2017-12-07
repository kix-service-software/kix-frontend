import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

class TicketInfoWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            showConfiguration: false,
            ticketAttr: [
                {
                    label: 'Kundennummer',
                    value: 'ABC'
                },
                {
                    label: 'Typ',
                    value: 'Bug'
                },
                {
                    label: 'Status',
                    value: 'in Bearbeitung'
                },
            ]
        };
    }

    public showConfigurationClicked(): void {
        ApplicationStore.getInstance().toggleDialog('ticket-info-configuration');
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = TicketInfoWidgetComponent;
