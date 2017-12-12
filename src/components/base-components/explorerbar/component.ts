import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { DashboardStore } from "@kix/core/dist/browser/dashboard/DashboardStore";

class ExplorerbarComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            rows: [],
            configuredWidgets: []
        };
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.dashboardStateChanged.bind(this));
        DashboardStore.getInstance().addStateListener(this.dashboardStateChanged.bind(this));
        this.dashboardStateChanged();
    }

    private dashboardStateChanged(): void {
        const explorerConfiguration = DashboardStore.getInstance().getDashboardExplorers();

        if (explorerConfiguration && explorerConfiguration.length) {
            this.state.rows = explorerConfiguration[0];
            this.state.configuredWidgets = explorerConfiguration[1];
        } else {
            this.state.rows = [];
            this.state.configuredWidgets = [];
        }
    }

    private getWidgetTemplate(instanceId: string): any {
        return DashboardStore.getInstance().getWidgetTemplate(instanceId);
    }
}

module.exports = ExplorerbarComponent;
