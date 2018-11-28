import {
    AbstractMarkoComponent, StandardTableFactoryService, SearchOperator,
    WidgetService, ActionFactory, TableConfiguration, KIXObjectService, LabelService, ContextService
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria, TicketType, SortUtil, TicketTypeProperty,
    DataType, SortOrder
} from '@kix/core/dist/model';
import { AdminContext } from '@kix/core/dist/browser/admin';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.predefinedTableFilter = [
            new KIXObjectPropertyFilter(
                'Gültig', [new TableFilterCriteria('ValidID', SearchOperator.EQUALS, 1, false)]
            ),
            new KIXObjectPropertyFilter(
                'Ungültig', [new TableFilterCriteria('ValidID', SearchOperator.EQUALS, 2, false)]
            ),
            new KIXObjectPropertyFilter(
                'Temporär ungültig', [new TableFilterCriteria('ValidID', SearchOperator.EQUALS, 3, false)]
            )
        ];

        this.prepareActions();

        const ticketTypes = await KIXObjectService.loadObjects<TicketType>(KIXObjectType.TICKET_TYPE);
        await this.prepareTitle(ticketTypes.length);
        await this.prepareTable(ticketTypes);
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
}

module.exports = Component;
