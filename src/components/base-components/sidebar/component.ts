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
        const dashboardConfiguration: DashboardConfiguration = DashboardStore.getInstance().getDashboardConfiguration();
        if (dashboardConfiguration) {
            this.state.rows = dashboardConfiguration.sidebarRows;
            this.state.configuredWidgets = dashboardConfiguration.sidebarConfiguredWidgets;
            this.state.widgetTemplates = dashboardConfiguration.widgetTemplates;
        }
    }

    private toggleSidebarWidget(instanceId: string): void {
        if (this.state.configuredWidgets) {
            const configuredWidget: ConfiguredWidget = this.state.configuredWidgets.find(
                (cw) => cw.instanceId === instanceId
            );
            if (configuredWidget) {
                configuredWidget.configuration.show = !configuredWidget.configuration.show;
                (this as any).setStateDirty('configuration');
                DashboardStore.getInstance().saveWidgetConfiguration(
                    configuredWidget.instanceId,
                    configuredWidget.configuration,
                );
            }
        }
    }

    private isShown(instanceId: string): boolean {
        let isShown: boolean = false;
        if (this.state.rows) {
            let instanceIds = [];
            this.state.rows.forEach((row) => {
                instanceIds = [...instanceIds, ...row];
            });
            isShown = instanceIds.some((wiId) => wiId === instanceId);
        }
        return isShown;
    }

    private toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }

    private getWidgetTemplate(instanceId: string): any {
        const widgetTemplate = this.state.widgetTemplates.find((wt) => wt.instanceId === instanceId);
        return (widgetTemplate && widgetTemplate.template) ? require(widgetTemplate.template) : '';
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
