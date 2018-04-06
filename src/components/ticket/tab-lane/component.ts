import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { Context, WidgetType } from '@kix/core/dist/model';

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

        const context = ContextService.getInstance().getContext();
        context.setWidgetType("tab-lane", WidgetType.LANE);
        this.state.tabWidgets.forEach((tab) => context.setWidgetType(tab.instanceId, WidgetType.LANE_TAB));
    }

    private tabClicked(tabId: string): void {
        this.state.activeTabId = tabId;
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getLaneTabWidgetType(): number {
        return WidgetType.LANE_TAB;
    }
}

module.exports = TabLaneComponent;
