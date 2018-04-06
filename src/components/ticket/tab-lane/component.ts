import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';

class TabLaneComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            activeTabId: null,
            tabWidgets: []
        };
    }

    public onInput(input: any): void {
        this.state.tabWidgets = input.tabWidgets;
    }

    public onMount(): void {
        if (!this.state.activeTabId && this.state.tabWidgets.length) {
            this.state.activeTabId = this.state.tabWidgets[0].instanceId;
        }
    }

    private tabClicked(tabId: string): void {
        this.state.activeTabId = tabId;
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

}

module.exports = TabLaneComponent;
