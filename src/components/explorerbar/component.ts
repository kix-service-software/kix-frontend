import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";
import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";
import { ContextFilter, Context, ConfiguredWidget, WidgetType } from "@kix/core/dist/model/";
import { DashboardConfiguration } from "@kix/core/dist/model/dashboard/DashboardConfiguration";

class ExplorerbarComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            explorer: []
        };
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
    }

    public contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (id === ContextService.getInstance().getActiveContextId()) {
            if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED ||
                type === ContextNotification.CONTEXT_CHANGED) {
                const context = ContextService.getInstance().getContext();
                this.state.explorer = context ? context.getWidgets(WidgetType.EXPLORER) : [];
            } else if (type === ContextNotification.EXPLORER_TOGGLED ||
                type === ContextNotification.EXPLORER_BAR_TOGGLED) {
                (this as any).setStateDirty('explorer');
            }
        }
    }

    private getWidgetTemplate(widget: ConfiguredWidget): any {
        return ClientStorageHandler.getComponentTemplate(widget.configuration.widgetId);
    }

    private isExplorerBarExpanded(instanceId: string): boolean {
        const context = ContextService.getInstance().getContext();
        return context.explorerBarExpanded;
    }

    private isExplorerMinimized(instanceId: string): boolean {
        const context = ContextService.getInstance().getContext();
        return context.isExplorerExpanded(instanceId);
    }

    private toggleExplorerBar(): void {
        ContextService.getInstance().toggleExplorerBar();
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

    private isConfigDialogShown(): boolean {
        return ApplicationStore.getInstance().isShowDialog();
    }

    private explorerAvailable(instanceId: string): boolean {
        return this.state.explorer.some((r) => r.instanceId === instanceId);
    }
}

module.exports = ExplorerbarComponent;
