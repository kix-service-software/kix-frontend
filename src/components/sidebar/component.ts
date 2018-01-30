import { SidebarComponentState } from './model/SidebarComponentState';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import { ContextFilter, Context, ConfiguredWidget, DashboardConfiguration, WidgetType } from '@kix/core/dist/model';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

class SidebarComponent {

    private state: SidebarComponentState;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
    }

    public onInput(input: any): void {
        if (input.hasOwnProperty('showIconBar') && input.showIconBar === false) {
            this.state.showIconBar = false;
        }

        this.state.context = input.context;
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
    }

    public contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (
            type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED &&
            id === ContextService.getInstance().getActiveContextId()
        ) {
            const context: Context = ContextService.getInstance().getContext();
            this.state.configuredWidgets = context ? context.getWidgets(WidgetType.SIDEBAR) : [];
            if (context && context.dashboardConfiguration) {
                let rows = [];
                for (const row of context.dashboardConfiguration.sidebarRows) {
                    rows = [...rows, ...row];
                }
                this.state.rows = rows;
            } else {
                this.state.rows = [];
            }
            if (this.hasSidebarsToShow()) {
                this.state.sidebarBarExpanded = true;
            } else {
                this.state.sidebarBarExpanded = false;
            }
        }
    }

    private applicationStateChanged(): void {
        //
    }

    private toggleSidebarWidget(instanceId: string): void {
        if (this.state.configuredWidgets) {

            const configuredWidget = this.state.configuredWidgets.find((cw) => cw.instanceId === instanceId);

            if (configuredWidget) {
                configuredWidget.configuration.show = !configuredWidget.configuration.show;

                DashboardService.getInstance().saveWidgetConfiguration(
                    configuredWidget.instanceId,
                    configuredWidget.configuration,
                );

                (this as any).setStateDirty('configuredWidgets');
            }
            if (this.state.sidebarBarExpanded && !this.hasSidebarsToShow()) {
                this.state.sidebarBarExpanded = false;
                ContextService.getInstance().toggleSidebarBar(this.state.sidebarBarExpanded);
            } else if (!this.state.sidebarBarExpanded && this.hasSidebarsToShow()) {
                this.state.sidebarBarExpanded = true;
                ContextService.getInstance().toggleSidebarBar(this.state.sidebarBarExpanded);
            }
        }
    }

    private sidebarAvailable(instanceId: string): boolean {
        return this.state.rows && this.state.rows.some((r) => r === instanceId);
    }

    private showSidebar(widget: ConfiguredWidget): boolean {
        return (
            (
                this.isConfigMode() ||
                widget.configuration.show
            ) &&
            this.sidebarAvailable(widget.instanceId)
        );
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        return context ? context.getWidgetTemplate(instanceId) : undefined;
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationStore.getInstance().isShowDialog();
    }

    private hasSidebarsToShow(): boolean {
        return this.state.rows &&
            this.state.rows.length &&
            this.state.configuredWidgets.some((w) => w.configuration.show);
    }
}

module.exports = SidebarComponent;
