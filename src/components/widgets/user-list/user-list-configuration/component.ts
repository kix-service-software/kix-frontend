import { DashboardStore } from "@kix/core/dist/browser/dashboard/DashboardStore";

class UserListConfigurationComponent {

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

    private limitChanged(event): void {
        this.state.configuration.settings.limit = event.target.value;
    }

    private saveConfiguration(): void {
        DashboardStore.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.configuration);
    }

}

module.exports = UserListConfigurationComponent;
