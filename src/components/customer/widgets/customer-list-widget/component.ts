import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, WidgetService, TableFactoryService, TableEvent
} from "../../../../core/browser";
import { KIXObjectType, KIXObjectPropertyFilter } from "../../../../core/model";
import { EventService } from "../../../../core/browser/event";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.actions = ActionFactory.getInstance().generateActions(
            this.state.widgetConfiguration.actions, null
        );
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, {
            eventSubscriberId: 'customer-list-widget' + this.state.instanceId,
            eventPublished: (data: any, eventId: string) => {
                if (eventId === TableEvent.TABLE_READY && data === this.state.table.getTableId()) {
                    this.prepareTitle();
                }
            }
        });
        this.setTableConfiguration();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            this.state.table = TableFactoryService.getInstance().createTable(
                KIXObjectType.CUSTOMER, this.state.widgetConfiguration.settings, null, null, true
            );

            WidgetService.getInstance().setActionData(this.state.instanceId, this.state.table);
        }
    }

    private prepareTitle(): void {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${this.state.table.getRows().length})`;
        }
        this.state.title = title;
    }

    public filter(filterValue: string, filter: KIXObjectPropertyFilter): void {
        this.state.table.setFilter(filterValue, filter ? filter.criteria : null);
        this.state.table.filter();
    }

}

module.exports = Component;
