import {
    AbstractMarkoComponent, StandardTableFactoryService, SearchOperator,
    WidgetService, ActionFactory, TableConfiguration, KIXObjectService, LabelService, ContextService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria, TicketType, SortUtil, TicketTypeProperty,
    DataType, SortOrder
} from '../../../../core/model';
import { AdminContext } from '../../../../core/browser/admin';
import { EventService, IEventListener } from '../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventListener {

    public eventSubscriberId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.eventSubscriberId = 'ticket-admin-types';
    }

    public async onMount(): Promise<void> {
        this.state.predefinedTableFilter = [
            new KIXObjectPropertyFilter(
                'Gültig', [new TableFilterCriteria(TicketTypeProperty.VALID_ID, SearchOperator.EQUALS, 1, false)]
            ),
            new KIXObjectPropertyFilter(
                'Ungültig', [new TableFilterCriteria(TicketTypeProperty.VALID_ID, SearchOperator.EQUALS, 2, false)]
            ),
            new KIXObjectPropertyFilter(
                'Temporär ungültig', [new TableFilterCriteria(
                    TicketTypeProperty.VALID_ID, SearchOperator.EQUALS, 3, false
                )]
            )
        ];

        this.prepareActions();

        const ticketTypes = await KIXObjectService.loadObjects<TicketType>(KIXObjectType.TICKET_TYPE);
        await this.prepareTitle(ticketTypes.length);
        await this.prepareTable(ticketTypes);

        EventService.getInstance().subscribe('TICKET_TYPE_LIST_UPDATED', this);
    }

    private async prepareTitle(count: number): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_TYPE);
        const typeName = labelProvider.getObjectName(true);
        this.state.title = `${context.categoryName}: ${typeName} (${count})`;
    }

    private async prepareTable(ticketTypes: TicketType[]): Promise<void> {
        const tableConfiguration = new TableConfiguration(null, null, null, null, true);
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            KIXObjectType.TICKET_TYPE, tableConfiguration, null, null, true
        );

        ticketTypes = SortUtil.sortObjects(ticketTypes, TicketTypeProperty.NAME, DataType.STRING, SortOrder.DOWN);

        table.layerConfiguration.contentLayer.setPreloadedObjects(ticketTypes);
        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        await table.loadRows();
        this.state.table = table;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe('TICKET_TYPE_LIST_UPDATED', this);
    }

    private prepareActions(): void {
        this.state.actions = ActionFactory.getInstance().generateActions(
            [
                'ticket-admin-type-create', 'ticket-admin-type-table-delete',
                'ticket-admin-type-import', 'csv-export-action'
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
        if (eventId === 'TICKET_TYPE_LIST_UPDATED') {
            const ticketTypes = await KIXObjectService.loadObjects<TicketType>(KIXObjectType.TICKET_TYPE);
            await this.prepareTitle(ticketTypes.length);
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(ticketTypes);
            await this.state.table.loadRows();
            this.state.table.listenerConfiguration.selectionListener.updateSelections(
                this.state.table.getTableRows(true)
            );
        }
    }
}

module.exports = Component;
