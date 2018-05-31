import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    TableRowHeight, StandardTable, IdService, TableSortLayer, TableFilterLayer, WidgetService
} from "@kix/core/dist/browser";
import { WidgetConfiguration, Customer, WidgetType } from "@kix/core/dist/model";
import {
    CustomerTableContentLayer, CustomerTableLabelLayer, CustomerDetailsContext
} from "@kix/core/dist/browser/customer";
import { ComponentRouterService } from "@kix/core/dist/browser/router";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        WidgetService.getInstance().setWidgetType('overview-tickets-group', WidgetType.GROUP);
    }

    private getTitle(): string {
        const title = this.state.widgetConfiguration
            ? this.state.widgetConfiguration.title
            : "";

        return `${title} (${this.state.ticketCount})`;
    }
}

module.exports = Component;
