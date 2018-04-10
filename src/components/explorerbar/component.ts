import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ContextNotification, ContextService } from '@kix/core/dist/browser/context/';
import { ConfiguredWidget, WidgetType } from '@kix/core/dist/model/';
import { ComponentsService } from '@kix/core/dist/browser/components';

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
                this.state.explorer = context ? (context.getExplorer() || []) : [];
            } else if (type === ContextNotification.EXPLORER_TOGGLED ||
                type === ContextNotification.EXPLORER_BAR_TOGGLED) {
                (this as any).setStateDirty('explorer');
            }
        }
    }

    private getWidgetTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
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
        ContextService.getInstance().getContext().toggleExplorerBar();
    }

    private isConfigMode(): boolean {
        return ApplicationService.getInstance().isConfigurationMode();
    }

    private explorerAvailable(instanceId: string): boolean {
        return this.state.explorer.some((r) => r.instanceId === instanceId);
    }
}

module.exports = ExplorerbarComponent;
