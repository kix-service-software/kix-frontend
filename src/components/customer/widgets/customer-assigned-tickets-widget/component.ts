import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, StandardTable, TableColumnConfiguration, StandardTableFactoryService
} from "../../../../core/browser";
import {
    WidgetConfiguration, Customer, KIXObjectType, Ticket, TicketProperty
} from "../../../../core/model";
import { TicketService } from "../../../../core/browser/ticket";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
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

        context.registerListener('customer-assigned-tickets-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (customerId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.initWidget(customer);
                }
            }
        });

        this.initWidget(await context.getObject<Customer>());

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

    private async initWidget(customer?: Customer): Promise<void> {
        this.state.customer = customer;
        this.setActions();
        this.createTables();
        this.loadTickets();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.customer) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.customer]
            );
        }
    }

    private createTables(): void {
        if (this.state.customer) {
            this.configureEscalatedTicketsTable();
            this.configureReminderTicketsTable();
            this.configureNewTicketsTable();
            this.configureOpenTicketsTable();
            this.configurePendingTicketsTable();
        }
    }

    private configureOpenTicketsTable(): void {
        if (this.state.openTicketsConfig) {
            this.state.openTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.openTicketsConfig.settings, null, null, true
            );
            this.state.openTicketsTable.setTableListener(() => {
                this.state.openFilterCount = this.state.openTicketsTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('openFilterCount');
            });
        }
    }

    private configureEscalatedTicketsTable(): void {
        if (this.state.escalatedTicketsConfig) {
            this.state.escalatedTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.escalatedTicketsConfig.settings, null, null, true
            );
            this.state.escalatedTicketsTable.setTableListener(() => {
                this.state.escalatedFilterCount = this.state.escalatedTicketsTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('escalatedFilterCount');
            });
        }
    }

    private configureReminderTicketsTable(): void {
        if (this.state.reminderTicketsConfig) {
            this.state.reminderTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.reminderTicketsConfig.settings, null, null, true
            );
            this.state.reminderTicketsTable.setTableListener(() => {
                this.state.reminderFilterCount = this.state.reminderTicketsTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('reminderFilterCount');
            });
        }
    }

    private configureNewTicketsTable(): void {
        if (this.state.newTicketsConfig) {
            this.state.newTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.newTicketsConfig.settings, null, null, true
            );
            this.state.newTicketsTable.setTableListener(() => {
                this.state.newFilterCount = this.state.newTicketsTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('newFilterCount');
            });
        }
    }

    private configurePendingTicketsTable(): void {
        if (this.state.pendingTicketsConfig) {
            this.state.pendingTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.pendingTicketsConfig.settings, null, null, true
            );
            this.state.pendingTicketsTable.setTableListener(() => {
                this.state.pendingFilterCount = this.state.pendingTicketsTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('pendingFilterCount');
            });
        }
    }

    private async loadTickets(): Promise<void> {
        this.loadEscalatedTickets();
        this.loadReminderTickets();
        this.loadNewTickets();
        this.loadOpenTickets();
        this.loadPendingTickets();
    }

    private async loadEscalatedTickets(): Promise<void> {
        this.state.loadEscalatedTickets = true;

        const tickets = await TicketService.getInstance().getEscalatedTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER
        );

        this.state.escalatedTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.escalatedTicketsTable.loadRows(true);
        this.state.loadEscalatedTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('customer-escalated-tickets-group');
        }
        this.state.escalatedTicketIds = tickets ? tickets.map((t) => t.TicketID) : [];
    }

    private async loadReminderTickets(): Promise<void> {
        this.state.loadReminderTickets = true;

        const tickets = await TicketService.getInstance().getReminderTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER
        );

        this.state.reminderTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.reminderTicketsTable.loadRows(true);
        this.state.loadReminderTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('customer-reminder-tickets-group');
        }
        this.state.reminderTicketIds = tickets ? tickets.map((t) => t.TicketID) : [];
    }

    private async loadNewTickets(): Promise<void> {
        this.state.loadNewTickets = true;

        const tickets = await TicketService.getInstance().getNewTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER
        );

        this.state.newTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.newTicketsTable.loadRows(true);
        this.state.loadNewTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('customer-new-tickets-group');
        }
        this.state.newTicketIds = tickets ? tickets.map((t) => t.TicketID) : [];
    }

    private async loadOpenTickets(): Promise<void> {
        this.state.loadOpenTickets = true;

        const tickets = await TicketService.getInstance().getOpenTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER
        );

        this.state.openTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.openTicketsTable.loadRows(true);
        this.state.loadOpenTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('customer-open-tickets-group');
        }
        this.state.openTicketIds = tickets ? tickets.map((t) => t.TicketID) : [];
    }

    private async loadPendingTickets(): Promise<void> {
        this.state.loadPendingTickets = true;

        const tickets = await TicketService.getInstance().getPendingTickets(
            this.state.customer.CustomerID, KIXObjectType.CUSTOMER
        );

        this.state.pendingTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.pendingTicketsTable.loadRows(true);
        this.state.loadPendingTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('customer-pending-tickets-group');
        }
        this.state.pendingTicketIds = tickets ? tickets.map((t) => t.TicketID) : [];
    }

    private openGroup(componentKey: string): void {
        if (componentKey) {
            const groupComponent = (this as any).getComponent(componentKey);
            if (groupComponent) {
                groupComponent.setMinizedState();
            }
        }
    }

    public getTitle(): string {
        const title = this.state.widgetConfiguration
            ? this.state.widgetConfiguration.title
            : "";

        return `${title} (${this.getTicketCount()})`;
    }

    private getTicketCount(): number {
        const ticketIds: number[] = [];

        if (this.state.escalatedTicketIds && !!this.state.escalatedTicketIds.length) {
            this.state.escalatedTicketIds.forEach((r) => {
                if (!ticketIds.some((t) => t === r)) {
                    ticketIds.push(r);
                }
            });
        }

        if (this.state.newTicketIds && !!this.state.newTicketIds.length) {
            this.state.newTicketIds.forEach((r) => {
                if (!ticketIds.some((t) => t === r)) {
                    ticketIds.push(r);
                }
            });
        }

        if (this.state.pendingTicketIds && !!this.state.pendingTicketIds.length) {
            this.state.pendingTicketIds.forEach((r) => {
                if (!ticketIds.some((t) => t === r)) {
                    ticketIds.push(r);
                }
            });
        }

        if (this.state.reminderTicketIds && !!this.state.reminderTicketIds.length) {
            this.state.reminderTicketIds.forEach((r) => {
                if (!ticketIds.some((t) => t === r)) {
                    ticketIds.push(r);
                }
            });
        }

        if (this.state.openTicketIds && !!this.state.openTicketIds.length) {
            this.state.openTicketIds.forEach((r) => {
                if (!ticketIds.some((t) => t === r)) {
                    ticketIds.push(r);
                }
            });
        }

        return ticketIds.length;
    }

    public getEscalatedTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.escalatedTicketsConfig,
            this.state.escalatedTicketIds ? this.state.escalatedTicketIds.length : 0,
            'Escalated Tickets'
        );
    }

    public getReminderTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.reminderTicketsConfig,
            this.state.reminderTicketIds ? this.state.reminderTicketIds.length : 0,
            'Reminder Tickets'
        );
    }

    public getNewTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.newTicketsConfig,
            this.state.newTicketIds ? this.state.newTicketIds.length : 0,
            'New Tickets'
        );
    }

    public getOpenTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.openTicketsConfig,
            this.state.openTicketIds ? this.state.openTicketIds.length : 0,
            'Reminder Tickets'
        );
    }

    public getPendingTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.pendingTicketsConfig,
            this.state.pendingTicketIds ? this.state.pendingTicketIds.length : 0,
            'Pending Tickets'
        );

    }

    private getTicketTableTitle(
        config: WidgetConfiguration,
        count: number = 0,
        defaultTitle: string = 'Tickets'
    ): string {
        const title = config ? config.title : defaultTitle;
        return `${title} (${count})`;
    }

    public filterEscalated(filterValue: string): void {
        this.state.escalatedFilterValue = filterValue;
        this.filter(this.state.escalatedTicketsTable, filterValue);
    }

    public filterReminder(filterValue: string): void {
        this.state.reminderFilterValue = filterValue;
        this.filter(this.state.reminderTicketsTable, filterValue);
    }

    public filterNew(filterValue: string): void {
        this.state.newFilterValue = filterValue;
        this.filter(this.state.newTicketsTable, filterValue);
    }

    public filterOpen(filterValue: string): void {
        this.state.openFilterValue = filterValue;
        this.filter(this.state.openTicketsTable, filterValue);
    }

    public filterPending(filterValue: string): void {
        this.state.pendingFilterValue = filterValue;
        this.filter(this.state.pendingTicketsTable, filterValue);
    }

    private filter(table: StandardTable<Ticket>, filterValue: string) {
        table.setFilterSettings(filterValue);
    }
}

module.exports = Component;
