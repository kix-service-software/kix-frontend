import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, TableFactoryService, SearchOperator, KIXObjectService,
    TableEvent, ITable, TableEventData
} from '../../../../core/browser';
import {
    WidgetConfiguration, Contact, KIXObjectType, TicketProperty, FilterCriteria,
    FilterType, FilterDataType, StateType, TicketState, DateTimeUtil
} from '../../../../core/model';
import { IEventSubscriber, EventService } from '../../../../core/browser/event';

class Component {

    private state: ComponentState;

    private tableEscalatedTicketsSubscriber: IEventSubscriber;
    private tableReminderTicketsSubscriber: IEventSubscriber;
    private tableNewTicketsSubscriber: IEventSubscriber;
    private tableOpenTicketsSubscriber: IEventSubscriber;
    private tablePendingTicketsSubscriber: IEventSubscriber;

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

        context.registerListener('contact-assigned-tickets-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.initWidget(contact);
                }
            }
        });

        this.initWidget(await context.getObject<Contact>());

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableEscalatedTicketsSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableReminderTicketsSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableNewTicketsSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableOpenTicketsSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tablePendingTicketsSubscriber);
    }

    private async initWidget(contact?: Contact): Promise<void> {
        this.state.contact = contact;
        this.setActions();
        await this.createTables();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact]
            );
        }
    }

    private async createTables(): Promise<void> {
        if (this.state.contact) {
            await this.configureEscalatedTicketsTable();
            await this.configureReminderTicketsTable();
            await this.configureNewTicketsTable();
            await this.configureOpenTicketsTable();
            await this.configurePendingTicketsTable();
        }
    }

    private async configureEscalatedTicketsTable(): Promise<void> {
        if (this.state.escalatedTicketsConfig) {
            const filter = [
                new FilterCriteria(
                    TicketProperty.CUSTOMER_USER_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, this.state.contact.ContactID
                ),
                new FilterCriteria(
                    TicketProperty.ESCALATION_TIME, SearchOperator.LESS_THAN, FilterDataType.NUMERIC, FilterType.AND, 0
                )
            ];

            this.state.escalatedTicketsConfig.settings.filter = filter;

            this.tableEscalatedTicketsSubscriber = {
                eventSubscriberId: 'contact-escalated-tickets-table',
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (
                        eventId === TableEvent.TABLE_READY && data
                        && data.tableId === this.state.escalatedTicketsTable.getTableId()
                    ) {
                        if (this.state.escalatedTicketsTable.getRows(true).length === 0) {
                            this.closeGroup('contact-escalated-tickets-group');
                        }
                        this.state.escalatedTicketsCount = this.state.escalatedTicketsTable.getRows().length;
                        this.state.escalatedTicketsFilterCount = this.state.escalatedTicketsTable.isFiltered()
                            ? this.state.escalatedTicketsTable.getRows().length
                            : null;
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableEscalatedTicketsSubscriber);

            this.state.escalatedTicketsTable = TableFactoryService.getInstance().createTable(
                KIXObjectType.TICKET, this.state.escalatedTicketsConfig.settings, null, null, true
            );
        }
    }

    private async configureReminderTicketsTable(): Promise<void> {
        if (this.state.reminderTicketsConfig) {
            const filter = [
                new FilterCriteria(
                    TicketProperty.CUSTOMER_USER_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, this.state.contact.ContactID
                ),
                new FilterCriteria(
                    TicketProperty.PENDING_TIME, SearchOperator.LESS_THAN, FilterDataType.DATETIME, FilterType.AND,
                    DateTimeUtil.getKIXDateTimeString(new Date())
                )
            ];

            this.state.reminderTicketsConfig.settings.filter = filter;

            this.tableReminderTicketsSubscriber = {
                eventSubscriberId: 'contact-reminder-tickets-table',
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (
                        eventId === TableEvent.TABLE_READY && data
                        && data.tableId === this.state.reminderTicketsTable.getTableId()
                    ) {
                        if (this.state.reminderTicketsTable.getRows(true).length === 0) {
                            this.closeGroup('contact-reminder-tickets-group');
                        }
                        this.state.reminderTicketsCount = this.state.reminderTicketsTable.getRows().length;
                        this.state.reminderTicketsFilterCount = this.state.reminderTicketsTable.isFiltered()
                            ? this.state.reminderTicketsTable.getRows().length
                            : null;
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableReminderTicketsSubscriber);

            this.state.reminderTicketsTable = TableFactoryService.getInstance().createTable(
                KIXObjectType.TICKET, this.state.reminderTicketsConfig.settings, null, null, true
            );
        }
    }

    private async configureNewTicketsTable(): Promise<void> {
        if (this.state.newTicketsConfig) {
            const filter = [
                new FilterCriteria(
                    TicketProperty.CUSTOMER_USER_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, this.state.contact.ContactID
                )
            ];

            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );

            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null
            );

            const newStateType = stateTypes.find((st) => st.Name === 'new');
            const stateIds = states.filter((s) => s.TypeID === newStateType.ID).map((t) => t.ID);

            filter.push(new FilterCriteria(
                TicketProperty.STATE_ID, SearchOperator.IN, FilterDataType.NUMERIC, FilterType.AND, stateIds
            ));

            this.state.newTicketsConfig.settings.filter = filter;

            this.tableNewTicketsSubscriber = {
                eventSubscriberId: 'contact-new-tickets-group',
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (
                        eventId === TableEvent.TABLE_READY && data
                        && data.tableId === this.state.newTicketsTable.getTableId()
                    ) {
                        if (this.state.newTicketsTable.getRows(true).length === 0) {
                            this.closeGroup('contact-new-tickets-group');
                        }
                        this.state.newTicketsCount = this.state.newTicketsTable.getRows().length;
                        this.state.newTicketsFilterCount = this.state.newTicketsTable.isFiltered()
                            ? this.state.newTicketsTable.getRows().length
                            : null;
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableNewTicketsSubscriber);

            this.state.newTicketsTable = TableFactoryService.getInstance().createTable(
                KIXObjectType.TICKET, this.state.newTicketsConfig.settings, null, null, true
            );
        }
    }

    private async configureOpenTicketsTable(): Promise<void> {
        if (this.state.openTicketsConfig) {
            const filter = [new FilterCriteria(
                TicketProperty.CUSTOMER_USER_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, this.state.contact.ContactID
            )];

            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );

            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null
            );

            const openStateType = stateTypes.find((st) => st.Name === 'open');
            const stateIds = states.filter((s) => s.TypeID === openStateType.ID).map((t) => t.ID);

            filter.push(new FilterCriteria(
                TicketProperty.STATE_ID, SearchOperator.IN, FilterDataType.NUMERIC, FilterType.AND, stateIds
            ));

            this.state.openTicketsConfig.settings.filter = filter;

            this.tableOpenTicketsSubscriber = {
                eventSubscriberId: 'contact-open-tickets-group',
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (
                        eventId === TableEvent.TABLE_READY && data
                        && data.tableId === this.state.openTicketsTable.getTableId()
                    ) {
                        if (this.state.openTicketsTable.getRows(true).length === 0) {
                            this.closeGroup('contact-open-tickets-group');
                        }
                        this.state.openTicketsCount = this.state.openTicketsTable.getRows().length;
                        this.state.openTicketsFilterCount = this.state.openTicketsTable.isFiltered()
                            ? this.state.openTicketsTable.getRows().length
                            : null;
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableOpenTicketsSubscriber);

            this.state.openTicketsTable = TableFactoryService.getInstance().createTable(
                KIXObjectType.TICKET, this.state.openTicketsConfig.settings, null, null, true
            );
        }
    }

    private async configurePendingTicketsTable(): Promise<void> {
        if (this.state.pendingTicketsConfig) {
            const filter = [
                new FilterCriteria(
                    TicketProperty.CUSTOMER_USER_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, this.state.contact.ContactID
                )
            ];

            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );

            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null
            );

            const pendingStateTypes = stateTypes.filter((st) => st.Name.indexOf('pending') !== -1);
            let stateIds = [];
            pendingStateTypes.forEach(
                (pst) => stateIds = [
                    ...stateIds,
                    ...states.filter((s) => s.TypeID === pst.ID).map((t) => t.ID)]
            );
            filter.push(new FilterCriteria(
                TicketProperty.STATE_ID, SearchOperator.IN, FilterDataType.NUMERIC, FilterType.AND, stateIds
            ));

            this.state.pendingTicketsConfig.settings.filter = filter;

            this.tablePendingTicketsSubscriber = {
                eventSubscriberId: 'contact-pending-tickets-group',
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (
                        eventId === TableEvent.TABLE_READY && data
                        && data.tableId === this.state.openTicketsTable.getTableId()
                    ) {
                        if (this.state.pendingTicketsTable.getRows(true).length === 0) {
                            this.closeGroup('contact-pending-tickets-group');
                        }
                        this.state.pendingTicketsCount = this.state.pendingTicketsTable.getRows().length;
                        this.state.pendingTicketsFilterCount = this.state.pendingTicketsTable.isFiltered()
                            ? this.state.pendingTicketsTable.getRows().length
                            : null;
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tablePendingTicketsSubscriber);

            this.state.pendingTicketsTable = TableFactoryService.getInstance().createTable(
                KIXObjectType.TICKET, this.state.pendingTicketsConfig.settings, null, null, true
            );
        }
    }

    private closeGroup(componentKey: string): void {
        if (componentKey) {
            const groupComponent = (this as any).getComponent(componentKey);
            if (groupComponent) {
                groupComponent.setMinizedState(true);
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
        const ids = [];

        let allIds = [];
        allIds = [...allIds, ...this.getTicketIds(this.state.escalatedTicketsTable)];
        allIds = [...allIds, ...this.getTicketIds(this.state.reminderTicketsTable)];
        allIds = [...allIds, ...this.getTicketIds(this.state.newTicketsTable)];
        allIds = [...allIds, ...this.getTicketIds(this.state.openTicketsTable)];
        allIds = [...allIds, ...this.getTicketIds(this.state.pendingTicketsTable)];

        allIds.forEach((id) => {
            if (!ids.some((existingId) => existingId === id)) {
                ids.push(id);
            }
        });

        return ids.length;
    }

    private getTicketIds(table: ITable): number[] {
        if (table) {
            return table.getRows(true)
                .filter((r) => r.getRowObject() !== null && typeof r.getRowObject() !== 'undefined')
                .map((r) => r.getRowObject().getObject().TicketID);
        }
        return [];

    }

    public getEscalatedTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.escalatedTicketsConfig,
            this.state.escalatedTicketsTable ? this.state.escalatedTicketsTable.getRows(true).length : 0,
            'Escalated Tickets'
        );
    }

    public getReminderTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.reminderTicketsConfig,
            this.state.reminderTicketsTable ? this.state.reminderTicketsTable.getRows(true).length : 0,
            'Reminder Tickets'
        );
    }

    public getNewTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.newTicketsConfig,
            this.state.newTicketsTable ? this.state.newTicketsTable.getRows(true).length : 0,
            'New Tickets'
        );
    }

    public getOpenTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.openTicketsConfig,
            this.state.openTicketsTable ? this.state.openTicketsTable.getRows(true).length : 0,
            'Reminder Tickets'
        );
    }

    public getPendingTicketsTitle(): string {
        return this.getTicketTableTitle(
            this.state.pendingTicketsConfig,
            this.state.pendingTicketsTable ? this.state.pendingTicketsTable.getRows(true).length : 0,
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

    private filter(table: ITable, filterValue: string) {
        table.setFilter(filterValue);
        table.filter();
    }
}

module.exports = Component;
