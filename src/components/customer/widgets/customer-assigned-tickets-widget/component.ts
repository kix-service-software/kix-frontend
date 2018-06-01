import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    TableRowHeight, StandardTable, IdService, TableSortLayer, TableFilterLayer, WidgetService, TableColumnConfiguration
} from "@kix/core/dist/browser";
import { WidgetConfiguration, Customer, WidgetType, KIXObjectType } from "@kix/core/dist/model";
import {
    CustomerTableContentLayer, CustomerTableLabelLayer, CustomerDetailsContext
} from "@kix/core/dist/browser/customer";
import { ComponentRouterService } from "@kix/core/dist/browser/router";
import { TicketTableContentLayer, TicketTableLabelLayer, TicketService } from "@kix/core/dist/browser/ticket";

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

        this.state.escalatedTicketsConfig = context
            ? context.getWidgetConfiguration('customer-escalated-tickets-group')
            : undefined;

        this.state.reminderTicketsConfig = context
            ? context.getWidgetConfiguration('customer-reminder-tickets-group')
            : undefined;

        this.state.newTicketsConfig = context
            ? context.getWidgetConfiguration('customer-new-tickets-group')
            : undefined;

        this.state.pendingTicketsConfig = context
            ? context.getWidgetConfiguration('customer-pending-tickets-group')
            : undefined;

        this.state.customer = (context.getObject(context.objectId) as Customer);

        this.createTables();
        this.loadTickets();
    }

    private createTables(): void {
        if (this.state.customer) {
            this.configureOpenTicketsTable();
            this.configureEscalatedTicketsTable();
            this.configureReminderTicketsTable();
            this.configureNewTicketsTable();
            this.configurePendingTicketsTable();
        }
    }

    private configureOpenTicketsTable(): void {
        if (this.state.openTicketsConfig) {
            const tableId = 'customer-open-tickets-' + IdService.generateDateBasedId();
            this.state.openTicketsTable = new StandardTable(
                tableId,
                new TicketTableContentLayer(tableId, []),
                new TicketTableLabelLayer(),
                [], [], null, null, null,
                this.state.openTicketsConfig.settings.tableColumns,
                null, null, null,
                this.state.openTicketsConfig.settings.displayLimit,
                false, TableRowHeight.SMALL
            );
        }
    }

    private configureEscalatedTicketsTable(): void {
        if (this.state.escalatedTicketsConfig) {
            const tableId = 'customer-escalated-tickets-' + IdService.generateDateBasedId();
            this.state.escalatedTicketsTable = new StandardTable(
                tableId,
                new TicketTableContentLayer(tableId, []),
                new TicketTableLabelLayer(),
                [], [], null, null, null,
                this.state.escalatedTicketsConfig.settings.tableColumns,
                null, null, null,
                this.state.escalatedTicketsConfig.settings.displayLimit,
                false, TableRowHeight.SMALL
            );
        }
    }

    private configureReminderTicketsTable(): void {
        if (this.state.reminderTicketsConfig) {
            const tableId = 'customer-reminder-tickets-' + IdService.generateDateBasedId();
            this.state.reminderTicketsTable = new StandardTable(
                tableId,
                new TicketTableContentLayer(tableId, []),
                new TicketTableLabelLayer(),
                [], [], null, null, null,
                this.state.reminderTicketsConfig.settings.tableColumns,
                null, null, null,
                this.state.reminderTicketsConfig.settings.displayLimit,
                false, TableRowHeight.SMALL
            );
        }
    }

    private configureNewTicketsTable(): void {
        if (this.state.newTicketsConfig) {
            const tableId = 'customer-new-tickets-' + IdService.generateDateBasedId();
            this.state.newTicketsTable = new StandardTable(
                tableId,
                new TicketTableContentLayer(tableId, []),
                new TicketTableLabelLayer(),
                [], [], null, null, null,
                this.state.newTicketsConfig.settings.tableColumns,
                null, null, null,
                this.state.newTicketsConfig.settings.displayLimit,
                false, TableRowHeight.SMALL
            );
        }
    }

    private configurePendingTicketsTable(): void {
        if (this.state.pendingTicketsConfig) {
            const tableId = 'customer-pending-tickets-' + IdService.generateDateBasedId();
            this.state.pendingTicketsTable = new StandardTable(
                tableId,
                new TicketTableContentLayer(tableId, []),
                new TicketTableLabelLayer(),
                [], [], null, null, null,
                this.state.pendingTicketsConfig.settings.tableColumns,
                null, null, null,
                this.state.pendingTicketsConfig.settings.displayLimit,
                false, TableRowHeight.SMALL
            );
        }
    }

    private async  loadTickets(): Promise<void> {
        this.loadEscalatedTickets();
        this.loadReminderTickets();
        this.loadOpenTickets();
        this.loadPendingTickets();
        this.loadNewTickets();
    }

    private async loadEscalatedTickets(): Promise<void> {
        this.state.loadEscalatedTickets = true;

        const properties = this.state.escalatedTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getPendingTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER, properties
        );

        (this.state.escalatedTicketsTable.contentLayer as TicketTableContentLayer).setPreloadedTickets(tickets);
        this.state.escalatedTicketsTable.loadRows(true);
        this.state.loadEscalatedTickets = false;
    }

    private async loadReminderTickets(): Promise<void> {
        this.state.loadReminderTickets = true;

        const properties = this.state.reminderTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getPendingTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER, properties
        );

        (this.state.reminderTicketsTable.contentLayer as TicketTableContentLayer).setPreloadedTickets(tickets);
        this.state.reminderTicketsTable.loadRows(true);
        this.state.loadReminderTickets = false;
    }

    private async loadOpenTickets(): Promise<void> {
        this.state.loadOpenTickets = true;

        const properties = this.state.openTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getOpenTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER, properties
        );

        (this.state.openTicketsTable.contentLayer as TicketTableContentLayer).setPreloadedTickets(tickets);
        this.state.openTicketsTable.loadRows(true);
        this.state.loadOpenTickets = false;
    }

    private async loadNewTickets(): Promise<void> {
        this.state.loadNewTickets = true;

        const properties = this.state.newTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getNewTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER, properties
        );

        (this.state.newTicketsTable.contentLayer as TicketTableContentLayer).setPreloadedTickets(tickets);
        this.state.newTicketsTable.loadRows(true);
        this.state.loadNewTickets = false;
    }

    private async loadPendingTickets(): Promise<void> {
        this.state.loadPendingTickets = true;

        const properties = this.state.newTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getPendingTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER, properties
        );

        (this.state.newTicketsTable.contentLayer as TicketTableContentLayer).setPreloadedTickets(tickets);
        this.state.newTicketsTable.loadRows(true);
        this.state.loadPendingTickets = false;
    }

    private getTitle(): string {
        const title = this.state.widgetConfiguration
            ? this.state.widgetConfiguration.title
            : "";

        return `${title} (${this.getTicketCount()})`;
    }

    private getTicketCount(): number {
        const tickets: number[] = [];

        if (this.state.escalatedTicketsTable) {
            this.state.escalatedTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        if (this.state.escalatedTicketsTable) {
            this.state.newTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        if (this.state.escalatedTicketsTable) {
            this.state.pendingTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        if (this.state.escalatedTicketsTable) {
            this.state.reminderTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        if (this.state.escalatedTicketsTable) {
            this.state.openTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }


        return tickets.length;
    }

    private getEscalatedTicketsTitle(): string {
        const title = (this.state.escalatedTicketsConfig
            ? this.state.escalatedTicketsConfig.title
            : "Escalated Tickets");
        const count = this.state.escalatedTicketsTable
            ? this.state.escalatedTicketsTable.getTableRows().length
            : 0;
        return `${title} (${count})`;
    }

    private getReminderTicketsTitle(): string {
        const title = (this.state.reminderTicketsConfig
            ? this.state.reminderTicketsConfig.title
            : "Reminder Tickets");
        const count = this.state.reminderTicketsTable
            ? this.state.reminderTicketsTable.getTableRows().length
            : 0;
        return `${title} (${count})`;
    }

    private getNewTicketsTitle(): string {
        const title = (this.state.newTicketsConfig
            ? this.state.newTicketsConfig.title
            : "New Tickets");
        const count = this.state.newTicketsTable
            ? this.state.newTicketsTable.getTableRows().length
            : 0;
        return `${title} (${count})`;
    }

    private getOpenTicketsTitle(): string {
        const title = (this.state.openTicketsConfig
            ? this.state.openTicketsConfig.title
            : "Reminder Tickets");
        const count = this.state.openTicketsTable
            ? this.state.openTicketsTable.getTableRows().length
            : 0;
        return `${title} (${count})`;
    }

    private getPendingTicketsTitle(): string {
        const title = (this.state.pendingTicketsConfig
            ? this.state.pendingTicketsConfig.title
            : "Pending Tickets");
        const count = this.state.pendingTicketsTable
            ? this.state.pendingTicketsTable.getTableRows().length
            : 0;
        return `${title} (${count})`;
    }
}

module.exports = Component;
