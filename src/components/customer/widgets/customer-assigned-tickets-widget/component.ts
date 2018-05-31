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
import { TicketTableContentLayer, TicketTableLabelLayer } from "@kix/core/dist/browser/ticket";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.openTicketsConfig = context
            ? context.getWidgetConfiguration('customer-open-tickets-group')
            : undefined;

        this.state.customer = (context.getObject(context.objectId) as Customer);
        this.createTables();
    }

    private createTables(): void {
        if (this.state.customer) {
            this.configureOpenTicketsTable();
        }
    }

    private configureOpenTicketsTable(): void {
        if (this.state.openTicketsConfig) {
            const tableId = 'customer-open-tickets-' + IdService.generateDateBasedId();
            this.state.openTicketsTable = new StandardTable(
                tableId,
                new TicketTableContentLayer(tableId, this.state.customer.CustomerID, [4]),
                new TicketTableLabelLayer(),
                [], [], null, null, null,
                this.state.openTicketsConfig.settings.tableColumns,
                null, null, null,
                this.state.openTicketsConfig.settings.displayLimit,
                false, TableRowHeight.SMALL
            );
        }
    }

    private getTitle(): string {
        const title = this.state.widgetConfiguration
            ? this.state.widgetConfiguration.title
            : "";

        return `${title} (${this.state.ticketCount})`;
    }
}

module.exports = Component;
