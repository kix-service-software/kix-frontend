import {
    AbstractMarkoComponent, StandardTableFactoryService, SearchOperator,
    WidgetService, ActionFactory, TableConfiguration, KIXObjectService, LabelService, ContextService
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria, TicketState, SortUtil, TicketStateProperty,
    DataType, SortOrder, TicketStateType
} from '../../../../core/model';
import { AdminContext } from '../../../../core/browser/admin';
import { EventService, IEventListener } from '../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventListener {

    public eventSubscriberId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.eventSubscriberId = 'ticket-admin-states';
    }

    public async onMount(): Promise<void> {
        this.state.predefinedTableFilter = [
            new KIXObjectPropertyFilter(
                'Gültig', [new TableFilterCriteria(TicketStateProperty.VALID_ID, SearchOperator.EQUALS, 1, false)]
            ),
            new KIXObjectPropertyFilter(
                'Ungültig', [new TableFilterCriteria(TicketStateProperty.VALID_ID, SearchOperator.EQUALS, 2, false)]
            ),
            new KIXObjectPropertyFilter(
                'Temporär ungültig', [new TableFilterCriteria(
                    TicketStateProperty.VALID_ID, SearchOperator.EQUALS, 3, false
                )]
            )
        ];

        const stateTypes = await KIXObjectService.loadObjects<TicketStateType>(KIXObjectType.TICKET_STATE_TYPE);
        if (stateTypes && !!stateTypes.length) {
            stateTypes.forEach((st) => {
                this.state.predefinedTableFilter.push(new KIXObjectPropertyFilter(st.Name, [
                    new TableFilterCriteria(TicketStateProperty.TYPE_NAME, SearchOperator.EQUALS, st.Name, false)
                ]));
            });
        }

        this.prepareActions();

        const ticketState = await KIXObjectService.loadObjects<TicketState>(KIXObjectType.TICKET_STATE);
        await this.prepareTitle(ticketState.length);
        await this.prepareTable(ticketState);

        EventService.getInstance().subscribe('TICKET_STATE_LIST_UPDATED', this);
    }

    private async prepareTitle(count: number): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET_STATE);
        const stateName = labelProvider.getObjectName(true);
        this.state.title = `${context.categoryName}: ${stateName} (${count})`;
    }

    private async prepareTable(ticketState: TicketState[]): Promise<void> {
        const tableConfiguration = new TableConfiguration(null, null, null, null, true);
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            KIXObjectType.TICKET_STATE, tableConfiguration, null, null, true
        );

        ticketState = SortUtil.sortObjects(ticketState, TicketStateProperty.NAME, DataType.STRING, SortOrder.DOWN);

        table.layerConfiguration.contentLayer.setPreloadedObjects(ticketState);
        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        await table.loadRows();
        this.state.table = table;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe('TICKET_STATE_LIST_UPDATED', this);
    }

    private prepareActions(): void {
        this.state.actions = ActionFactory.getInstance().generateActions(
            [
                'ticket-admin-state-create', 'ticket-admin-state-table-delete',
                'ticket-admin-state-import', 'csv-export-action'
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
        if (eventId === 'TICKET_STATE_LIST_UPDATED') {
            const ticketStates = await KIXObjectService.loadObjects<TicketState>(KIXObjectType.TICKET_STATE);
            await this.prepareTitle(ticketStates.length);
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(ticketStates);
            await this.state.table.loadRows();
            this.state.table.listenerConfiguration.selectionListener.updateSelections(
                this.state.table.getTableRows(true)
            );
        }
    }
}

module.exports = Component;
