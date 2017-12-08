import { SidebarComponentState } from './model/SidebarComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { ConfiguredWidget, DashboardConfiguration } from '@kix/core/dist/model';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

class SidebarComponent {

    private state: SidebarComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
        if (input.hasOwnProperty('showIconBar') && input.showIconBar === false) {
            this.state.showIconBar = false;
        }
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
        DashboardStore.getInstance().addStateListener(this.dashboardStateChanged.bind(this));
        this.dashboardStateChanged();
    }

    private dashboardStateChanged(): void {
        const sidebarConfiguration = DashboardStore.getInstance().getDashboardSidebars();
        this.state.rows = sidebarConfiguration[0];
        this.state.configuredWidgets = sidebarConfiguration[1];
    }

    private toggleSidebarWidget(instanceId: string): void {
        if (this.state.configuredWidgets) {

            const configuredWidget = this.state.configuredWidgets.find((cw) => cw.instanceId === instanceId);

            if (configuredWidget) {
                configuredWidget.configuration.show = !configuredWidget.configuration.show;

                DashboardStore.getInstance().saveWidgetConfiguration(
                    configuredWidget.instanceId,
                    configuredWidget.configuration,
                );

                (this as any).setStateDirty('configuration');
            }
        }
    }

    private sidebarAvailable(instanceId: string): boolean {
        return this.state.rows.some((r) => r === instanceId);
    }

    private getWidgetTemplate(instanceId: string): any {
        return DashboardStore.getInstance().getWidgetTemplate(instanceId);
    }

    private applicationStateChanged() {
        (this as any).setStateDirty();
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationStore.getInstance().isShowDialog();
    }

    private hasSidebarsToShow(): boolean {
        return this.state.configuredWidgets.some((w) => w.configuration.show);
    }
}

module.exports = SidebarComponent;
