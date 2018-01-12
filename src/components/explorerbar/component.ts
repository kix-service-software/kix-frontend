import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { DashboardStore } from "@kix/core/dist/browser/dashboard/DashboardStore";
import { ContextService } from "@kix/core/dist/browser/context/ContextService";
import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";
import { ConfiguredWidget, WidgetType } from "@kix/core/dist/model/";

class ExplorerbarComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            explorer: []
        };
    }

    public onMount(): void {
        ContextService.getInstance().addContextListener(this.contextStateChanged.bind(this));
    }

    private contextStateChanged(): void {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            this.state.explorer = context.getWidgets(WidgetType.EXPLORER);
        }
    }

    private getWidgetTemplate(widget: ConfiguredWidget): any {
        return ClientStorageHandler.getComponentTemplate(widget.configuration.widgetId);
    }

    private isExplorerBarExpanded(instanceId: string): boolean {
        const context = ContextService.getInstance().getActiveContext();
        return context.explorerBarExpanded;
    }

    private isExplorerMinimized(instanceId: string): boolean {
        const context = ContextService.getInstance().getActiveContext();
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
