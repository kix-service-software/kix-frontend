import { ContextService } from '../../../core/browser/context';
import { ComponentsService, TabContainerEvent } from '../../../core/browser/components';
import { WidgetType, ConfiguredWidget } from '../../../core/model';
import { ComponentState } from './ComponentState';
import { WidgetService, ActionFactory, IdService } from '../../../core/browser';
import { IEventSubscriber, EventService } from '../../../core/browser/event';

class TabLaneComponent implements IEventSubscriber {

    public eventSubscriberId: string = IdService.generateDateBasedId('tab-container');

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.tabWidgets);

        this.state.tabWidgets = input.tabWidgets ? input.tabWidgets : [];
        this.state.tabId = input.tabId;
        this.state.title = input.title;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
        this.state.contextType = input.contextType;
        this.state.showSidebar = typeof input.showSidebar !== 'undefined' ? input.showSidebar : true;

        WidgetService.getInstance().setWidgetType("tab-widget", WidgetType.LANE);
        this.state.tabWidgets.forEach(
            (tab) => WidgetService.getInstance().setWidgetType(tab.instanceId, WidgetType.LANE_TAB)
        );
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TITLE, this);
    }

    public async onMount(): Promise<void> {
        if (this.state.tabWidgets.length) {
            if (this.state.tabId) {
                await this.tabClicked(this.state.tabWidgets.find((tw) => tw.instanceId === this.state.tabId));
            }
            if (!this.state.activeTab) {
                await this.tabClicked(this.state.tabWidgets[0]);
            }
        }

        if (this.state.contextType) {
            this.setSidebars();
        }

        if (this.state.tabWidgets.length && this.state.activeTab && this.state.tabId) {
            const tab = this.state.tabWidgets.find((tw) => tw.instanceId === this.state.tabId);
            if (tab && tab.instanceId !== this.state.activeTab.instanceId) {
                this.state.activeTab = tab;
            }
        }
    }

    public async tabClicked(tab: ConfiguredWidget): Promise<void> {
        this.state.activeTab = tab;
        if (tab) {
            const context = await ContextService.getInstance().getActiveContext(this.state.contextType);
            if (context) {
                const object = await context.getObject(context.getDescriptor().kixObjectTypes[0]);

                this.state.contentActions = ActionFactory.getInstance().generateActions(
                    tab.configuration.actions, [object]
                );
            }
        }
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

    public eventPublished(data: any, eventId: string): void {
        if (eventId === TabContainerEvent.CHANGE_TITLE) {
            const tab = this.state.tabWidgets.find((t) => t.instanceId === data.tabId);
            if (tab) {
                tab.configuration.title = data.title;
                (this as any).setStateDirty();
            }
        }
    }
}

module.exports = TabLaneComponent;
