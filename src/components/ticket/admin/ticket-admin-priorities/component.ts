import {
    AbstractMarkoComponent, SearchOperator, KIXObjectService, ContextService, LabelService,
    TableConfiguration, StandardTableFactoryService, WidgetService, ActionFactory
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { EventService, IEventListener } from '@kix/core/dist/browser/event';
import {
    KIXObjectPropertyFilter, TableFilterCriteria, TicketPriority, KIXObjectType,
    SortUtil, DataType, SortOrder, TicketPriorityProperty
} from '@kix/core/dist/model';
import { AdminContext } from '@kix/core/dist/browser/admin';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventListener {

    public eventSubscriberId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.eventSubscriberId = 'ticket-admin-priorities';
    }

    public async onMount(): Promise<void> {
        this.state.predefinedTableFilter = [
            new KIXObjectPropertyFilter('Gültig', [
                new TableFilterCriteria(TicketPriorityProperty.VALID_ID, SearchOperator.EQUALS, 1, false
                )]
            ),
            new KIXObjectPropertyFilter('Ungültig', [
                new TableFilterCriteria(TicketPriorityProperty.VALID_ID, SearchOperator.EQUALS, 2, false
                )]
            ),
            new KIXObjectPropertyFilter('Temporär ungültig', [
                new TableFilterCriteria(TicketPriorityProperty.VALID_ID, SearchOperator.EQUALS, 3, false)
            ])
        ];

        this.prepareActions();

        const priorities = await KIXObjectService.loadObjects<TicketPriority>(KIXObjectType.TICKET_PRIORITY);
        await this.prepareTitle(priorities.length);
        await this.prepareTable(priorities);

        EventService.getInstance().subscribe('TICKET_PRIORITY_LIST_UPDATED', this);
    }

    private async prepareTitle(count: number): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_PRIORITY);
        const priorityName = labelProvider.getObjectName(true);
        this.state.title = `${context.categoryName}: ${priorityName} (${count})`;
    }

    private async prepareTable(priorities: TicketPriority[]): Promise<void> {
        const tableConfiguration = new TableConfiguration(null, null, null, null, true);
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            KIXObjectType.TICKET_PRIORITY, tableConfiguration, null, null, true
        );

        priorities = SortUtil.sortObjects(priorities, TicketPriorityProperty.NAME, DataType.STRING, SortOrder.DOWN);

        table.layerConfiguration.contentLayer.setPreloadedObjects(priorities);
        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        await table.loadRows();
        this.state.table = table;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe('TICKET_PRIORITY_LIST_UPDATED', this);
    }

    private prepareActions(): void {
        this.state.actions = ActionFactory.getInstance().generateActions(
            [
                'ticket-admin-priority-create', 'ticket-admin-priority-table-delete',
                'ticket-admin-priority-import', 'csv-export-action'
            ], null
        );

        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            await this.state.table.setFilterSettings(textFilterValue, filter);
            this.state.filterCount = this.state.table.getTableRows(true).length;
            (this as any).setStateDirty('filterCount');
        }
    }

    public async eventPublished(data: any, eventId: string): Promise<void> {
        if (eventId === 'TICKET_PRIORITY_LIST_UPDATED') {
            const priorities = await KIXObjectService.loadObjects<TicketPriority>(KIXObjectType.TICKET_PRIORITY);
            await this.prepareTitle(priorities.length);
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(priorities);
            await this.state.table.loadRows();
            this.state.table.listenerConfiguration.selectionListener.updateSelections(
                this.state.table.getTableRows(true)
            );
        }
    }

}

module.exports = Component;
