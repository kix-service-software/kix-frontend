import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { DashboardStore } from "@kix/core/dist/browser/dashboard/DashboardStore";
import { ContextStore } from "@kix/core/dist/browser/context/ContextStore";

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
        ContextStore.getInstance().addStateListener(this.contextStateChanged.bind(this));
        this.dashboardStateChanged();
    }

    private dashboardStateChanged(): void {
        const explorerConfiguration = DashboardStore.getInstance().getDashboardExplorers();

        if (explorerConfiguration && explorerConfiguration.length) {
            this.state.rows = explorerConfiguration[0];
            this.state.configuredWidgets = explorerConfiguration[1];

            ContextStore.getInstance().provideExplorer(this.state.rows);
        } else {
            ContextStore.getInstance().provideExplorer([]);
            this.state.rows = [];
            this.state.configuredWidgets = [];
        }
    }

    private contextStateChanged(): void {
        (this as any).setStateDirty('rows');
    }

    private getWidgetTemplate(instanceId: string): any {
        return DashboardStore.getInstance().getWidgetTemplate(instanceId);
    }

    private isExplorerBarExpanded(instanceId: string): boolean {
        return ContextStore.getInstance().getExplorerBarExpandedState();
    }

    private isExplorerMinimized(instanceId: string): boolean {
        return ContextStore.getInstance().getExplorerExpandedState(instanceId);
    }

    private toggleExplorerBar(): void {
        ContextStore.getInstance().toggleExplorerBar();
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationStore.getInstance().isShowDialog();
    }

    private explorerAvailable(instanceId: string): boolean {
        return this.state.rows.some((r) => r === instanceId);
    }
}

module.exports = ExplorerbarComponent;
