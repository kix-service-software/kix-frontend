import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { TicketInfoComponentState } from './model/TicketInfoComponentState';

class TicketInfoWidgetComponent {

    private state: TicketInfoComponentState;

    public onCreate(input: any): void {
        this.state = new TicketInfoComponentState();
        // TODO: gehört dann ggf eher in this.state.widgetConfiguration.settings
        this.state.ticketAttr = [
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
        ];
    }
    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);
    }

    private showConfigurationClicked(): void {
        ApplicationStore.getInstance().toggleDialog('ticket-info-configuration');
    }

    private saveConfiguration(): void {
        this.cancelConfiguration();
    }

    private cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = TicketInfoWidgetComponent;
