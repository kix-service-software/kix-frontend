import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ContextService } from '@kix/core/dist/browser/context/';
import { ConfiguredWidget, WidgetType } from '@kix/core/dist/model/';
import { ComponentsService } from '@kix/core/dist/browser/components';

class ExplorerbarComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            explorer: []
        };
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

    private explorerAvailable(instanceId: string): boolean {
        return this.state.explorer.some((r) => r.instanceId === instanceId);
    }
}

module.exports = ExplorerbarComponent;
