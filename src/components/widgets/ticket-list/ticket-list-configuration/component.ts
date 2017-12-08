import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class TicketListConfigurationComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            configuration: null,
            instanceId: null
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.configuration = DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);
    }

    public limitChanged(event: any): void {
        this.state.configuration.settings.limit = event.target.value;
    }

    public showTotalCountChanged(event: any): void {
        const currentShowTotalCount = this.state.configuration.settings.showTotalCount;
        this.state.configuration.settings.showTotalCount = !currentShowTotalCount;
    }

    private saveConfiguration(): void {
        DashboardStore.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.configuration);
    }

}

module.exports = TicketListConfigurationComponent;
