import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, StandardTable, TableColumnConfiguration, StandardTableFactoryService
} from '@kix/core/dist/browser';
import { WidgetConfiguration, Contact, KIXObjectType, Ticket } from '@kix/core/dist/model';
import { TicketService } from '@kix/core/dist/browser/ticket';

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
            ? context.getWidgetConfiguration('contact-open-tickets-group')
            : undefined;

        this.state.escalatedTicketsConfig = context
            ? context.getWidgetConfiguration('contact-escalated-tickets-group')
            : undefined;

        this.state.reminderTicketsConfig = context
            ? context.getWidgetConfiguration('contact-reminder-tickets-group')
            : undefined;

        this.state.newTicketsConfig = context
            ? context.getWidgetConfiguration('contact-new-tickets-group')
            : undefined;

        this.state.pendingTicketsConfig = context
            ? context.getWidgetConfiguration('contact-pending-tickets-group')
            : undefined;

        context.registerListener('contact-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.initWidget(contact);
                }
            }
        });


        this.initWidget(await context.getObject<Contact>());

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

    private async initWidget(contact?: Contact): Promise<void> {
        this.state.contact = contact;
        this.setActions();
        this.createTables();
        this.loadTickets();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact]
            );
        }
    }

    private createTables(): void {
        if (this.state.contact) {
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
        }
    }

    private configureEscalatedTicketsTable(): void {
        if (this.state.escalatedTicketsConfig) {
            this.state.escalatedTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.escalatedTicketsConfig.settings, null, null, true
            );
        }
    }

    private configureReminderTicketsTable(): void {
        if (this.state.reminderTicketsConfig) {
            this.state.reminderTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.reminderTicketsConfig.settings, null, null, true
            );
        }
    }

    private configureNewTicketsTable(): void {
        if (this.state.newTicketsConfig) {
            this.state.newTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.newTicketsConfig.settings, null, null, true
            );
        }
    }

    private configurePendingTicketsTable(): void {
        if (this.state.pendingTicketsConfig) {
            this.state.pendingTicketsTable = StandardTableFactoryService.getInstance().createStandardTable<Ticket>(
                KIXObjectType.TICKET, this.state.pendingTicketsConfig.settings, null, null, true
            );
        }
    }

    private async  loadTickets(): Promise<void> {
        this.loadEscalatedTickets();
        this.loadReminderTickets();
        this.loadNewTickets();
        this.loadOpenTickets();
        this.loadPendingTickets();
    }

    private async loadEscalatedTickets(): Promise<void> {
        this.state.loadEscalatedTickets = true;

        const properties = this.state.escalatedTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getEscalatedTickets(
            this.state.contact.ContactID, KIXObjectType.CONTACT, properties
        );

        this.state.escalatedTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.escalatedTicketsTable.loadRows(true);
        this.state.loadEscalatedTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('contact-escalated-tickets-group');
        }
    }

    private async loadReminderTickets(): Promise<void> {
        this.state.loadReminderTickets = true;

        const properties = this.state.reminderTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getReminderTickets(
            this.state.contact.ContactID, KIXObjectType.CONTACT, properties
        );

        this.state.reminderTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.reminderTicketsTable.loadRows(true);
        this.state.loadReminderTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('contact-reminder-tickets-group');
        }
    }

    private async loadNewTickets(): Promise<void> {
        this.state.loadNewTickets = true;

        const properties = this.state.newTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getNewTickets(
            this.state.contact.ContactID, KIXObjectType.CONTACT, properties
        );

        this.state.newTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.newTicketsTable.loadRows(true);
        this.state.loadNewTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('contact-new-tickets-group');
        }
    }

    private async loadOpenTickets(): Promise<void> {
        this.state.loadOpenTickets = true;

        const properties = this.state.openTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getOpenTickets(
            this.state.contact.ContactID, KIXObjectType.CONTACT, properties
        );

        this.state.openTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.openTicketsTable.loadRows(true);
        this.state.loadOpenTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('contact-open-tickets-group');
        }
    }

    private async loadPendingTickets(): Promise<void> {
        this.state.loadPendingTickets = true;

        const properties = this.state.pendingTicketsConfig.settings.tableColumns
            .map((tc: TableColumnConfiguration) => tc.columnId);

        const tickets = await TicketService.getInstance().getPendingTickets(
            this.state.contact.ContactID, KIXObjectType.CONTACT, properties
        );

        this.state.pendingTicketsTable.layerConfiguration.contentLayer.setPreloadedObjects(tickets);
        this.state.pendingTicketsTable.loadRows(true);
        this.state.loadPendingTickets = false;
        if (tickets && !!tickets.length) {
            this.openGroup('contact-pending-tickets-group');
        }
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
            : '';

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

        if (this.state.newTicketsTable) {
            this.state.newTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        if (this.state.pendingTicketsTable) {
            this.state.pendingTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        if (this.state.reminderTicketsTable) {
            this.state.reminderTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        if (this.state.openTicketsTable) {
            this.state.openTicketsTable.getTableRows().forEach((r) => {
                if (!tickets.some((t) => t === r.object.TicketID)) {
                    tickets.push(r.object.TicketID);
                }
            });
        }

        return tickets.length;
    }

    private getEscalatedTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.escalatedTicketsConfig, this.state.escalatedTicketsTable, 'Escalated Tickets'
        );
    }

    private getReminderTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.reminderTicketsConfig, this.state.reminderTicketsTable, 'Reminder Tickets'
        );
    }

    private getNewTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.newTicketsConfig, this.state.newTicketsTable, 'New Tickets'
        );
    }

    private getOpenTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.openTicketsConfig, this.state.openTicketsTable, 'Reminder Tickets'
        );
    }

    private getPendingTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.pendingTicketsConfig, this.state.pendingTicketsTable, 'Pending Tickets'
        );

    }

    public getTicketTableTitle(
        config: WidgetConfiguration,
        table: StandardTable<Ticket>,
        defaultTitle: string
    ): string {
        const title = config ? config.title : defaultTitle;
        const count = table ? table.getTableRows().length : 0;
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
