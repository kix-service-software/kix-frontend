import {
    AbstractMarkoComponent, SearchOperator, ContextService, LabelService,
    WidgetService, ActionFactory, TableFactoryService, TableEvent, TableEventData
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import {
    KIXObjectPropertyFilter, TableFilterCriteria, KIXObjectType, RoleProperty
} from '../../../../core/model';
import { AdminContext } from '../../../../core/browser/admin';

class Component extends AbstractMarkoComponent<ComponentState> {

    private tableSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.prepareActions();

        await this.prepareTitle();
        await this.prepareTable();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
    }

    private async prepareTitle(): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.ROLE);
        const roleName = await labelProvider.getObjectName(true);
        const count = this.state.table ? this.state.table.getRows(true).length : 0;
        this.state.title = `${context.categoryName}: ${roleName} (${count})`;
    }

    private async prepareTable(): Promise<void> {
        const table = TableFactoryService.getInstance().createTable(
            'roles', KIXObjectType.ROLE, null, null, null, true
        );

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.tableSubscriber = {
            eventSubscriberId: 'user-admin-role-table-listener',
            eventPublished: (data: TableEventData, eventId: string) => {
                if (data && data.tableId === table.getTableId()) {
                    if (eventId === TableEvent.TABLE_READY || eventId === TableEvent.TABLE_INITIALIZED) {
                        this.state.filterCount = this.state.table.isFiltered()
                            ? this.state.table.getRows().length : null;
                        this.prepareTitle();
                    }

                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);

        this.state.table = table;
    }

    private prepareActions(): void {
        this.state.actions = ActionFactory.getInstance().generateActions(
            [
                'user-admin-role-create', 'user-admin-role-table-delete',
                'user-admin-role-import', 'csv-export-action'
            ], null
        );

        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            this.state.table.setFilter(textFilterValue, filter ? filter.criteria : []);
            this.state.table.filter();
        }
    }

}

module.exports = Component;
