import { DashboardStore } from "@kix/core/dist/browser/dashboard/DashboardStore";
import { ContextService } from "@kix/core/dist/browser/context/ContextService";

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
        const context = ContextService.getInstance().getActiveContext();
        this.state.configuration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

    private limitChanged(event): void {
        this.state.configuration.settings.limit = event.target.value;
    }

    private saveConfiguration(): void {
        DashboardStore.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.configuration);
    }

}

module.exports = UserListConfigurationComponent;
