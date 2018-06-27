import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { WidgetType, ConfiguredWidget } from '@kix/core/dist/model';
import { TabContainerComponentState } from './TabContainerComponentState';
import { WidgetService } from '@kix/core/dist/browser';

class TabLaneComponent {

    private state: TabContainerComponentState;

    public onCreate(input: any): void {
        this.state = new TabContainerComponentState(input.tabWidgets);
    }


    public onInput(input: any): void {
        this.state.loading = true;
        this.state.tabWidgets = input.tabWidgets;
        this.state.tabId = input.tabId;
        if (this.state.tabWidgets.length && this.state.activeTab && this.state.tabId) {
            const tab = this.state.tabWidgets.find((tw) => tw.instanceId === this.state.tabId);
            if (tab && tab.instanceId !== this.state.activeTab.instanceId) {
                this.state.activeTab = tab;
            }
        }

        WidgetService.getInstance().setWidgetType("tab-widget", WidgetType.LANE);
        this.state.tabWidgets.forEach(
            (tab) => WidgetService.getInstance().setWidgetType(tab.instanceId, WidgetType.LANE_TAB)
        );

        this.state.title = input.title;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
        this.state.contextType = input.contextType;
        this.state.showSidebar = typeof input.showSidebar !== 'undefined' ? input.showSidebar : true;
        this.setSidebars();
        this.state.loading = false;
    }

    public onMount(): void {
        if (this.state.tabWidgets.length) {
            if (this.state.tabId) {
                this.state.activeTab = this.state.tabWidgets.find((tw) => tw.instanceId === this.state.tabId);
            }
            if (!this.state.activeTab) {
                this.state.activeTab = this.state.tabWidgets[0];
            }
        }

        if (this.state.contextType) {
            this.setSidebars();
        }

        this.state.loading = false;
    }

    public tabClicked(tab: ConfiguredWidget): void {
        this.state.activeTab = tab;
        (this as any).emit('tabChanged', tab);
    }

    public getWidgetTemplate(): any {
        return this.state.activeTab
            ? ComponentsService.getInstance().getComponentTemplate(this.state.activeTab.configuration.widgetId)
            : undefined;
    }

    public getLaneTabWidgetType(): number {
        return WidgetType.LANE_TAB;
    }

    private setSidebars(): void {
        if (this.state.showSidebar) {
            const context = ContextService.getInstance().getActiveContext(this.state.contextType);
            this.state.hasSidebars = context ? context.getSidebars().length > 0 : false;
        }
    }

    public isActiveTab(tabId: string): boolean {
        return this.state.activeTab && this.state.activeTab.instanceId === tabId;
    }
}

module.exports = TabLaneComponent;
