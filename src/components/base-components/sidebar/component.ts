import { SidebarComponentState } from './model/SidebarComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { ConfiguredWidget, DashboardConfiguration } from '@kix/core/dist/model';

class SidebarComponent {

    public state: SidebarComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
        if (input.hasOwnProperty('showIconBar') && input.showIconBar === false) {
            this.state.showIconBar = false;
        }
    }

    public onMount(): void {
        DashboardStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.stateChanged();
    }

    public stateChanged(): void {
        const dashboardConfiguration: DashboardConfiguration = DashboardStore.getInstance().getDashboardConfiguration();
        if (dashboardConfiguration) {
            this.state.rows = dashboardConfiguration.sidebarRows;
            this.state.configuredWidgets = dashboardConfiguration.sidebarConfiguredWidgets;
            this.state.widgetTemplates = dashboardConfiguration.widgetTemplates;
        }
    }

    public toggleSidebarWidget(instanceId: string): void {
        if (this.state.configuredWidgets) {
            const configuredWidget: ConfiguredWidget = this.state.configuredWidgets.find(
                (cw) => cw.instanceId === instanceId
            );
            if (configuredWidget) {
                configuredWidget.configuration.show = !configuredWidget.configuration.show;
                (this as any).setStateDirty('configuration');
                DashboardStore.getInstance().saveWidgetConfiguration(
                    configuredWidget.configuration.widgetId,
                    configuredWidget.instanceId,
                    configuredWidget.configuration,
                );
            }
        }
    }

    public isShown(instanceId: string): boolean {
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

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }

    public getWidgetTemplate(instanceId: string): any {
        const template = this.state.widgetTemplates.find((wt) => wt.instanceId === instanceId).template;
        return template ? require(template) : '';
    }
}

module.exports = SidebarComponent;
