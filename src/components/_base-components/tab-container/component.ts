import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { Context, WidgetType, ConfiguredWidget } from '@kix/core/dist/model';
import { TabContainerComponentState } from './TabContainerComponentState';

class TabLaneComponent {

    private state: TabContainerComponentState;

    public onCreate(): void {
        this.state = new TabContainerComponentState();
    }

    public onInput(input: any): void {
        this.state.tabWidgets = input.tabWidgets;
        this.state.title = input.title;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
    }

    public onMount(): void {
        if (!this.state.activeTab && this.state.tabWidgets.length) {
            this.state.activeTab = this.state.tabWidgets[0];
        }

        const context = ContextService.getInstance().getContext();
        context.setWidgetType("tab-widget", WidgetType.LANE);
        this.state.tabWidgets.forEach((tab) => context.setWidgetType(tab.instanceId, WidgetType.LANE_TAB));
    }

    private tabClicked(tab: ConfiguredWidget): void {
        this.state.activeTab = tab;
    }

    private getWidgetTemplate(): any {
        return this.state.activeTab
            ? ComponentsService.getInstance().getComponentTemplate(this.state.activeTab.configuration.widgetId)
            : undefined;
    }

    private getLaneTabWidgetType(): number {
        return WidgetType.LANE_TAB;
    }
}

module.exports = TabLaneComponent;
