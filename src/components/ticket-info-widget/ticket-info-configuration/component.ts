import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

export class TicketInfoConfigurationComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            configuration: null
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.configuration = DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);
    }

}

module.exports = TicketInfoConfigurationComponent;
