import {
    AbstractMarkoComponent, SearchOperator, KIXObjectService, ContextService, LabelService,
    TableConfiguration, StandardTableFactoryService, WidgetService, ActionFactory
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { IEventSubscriber, EventService } from '../../../../core/browser/event';
import {
    KIXObjectPropertyFilter, TableFilterCriteria, ConfigItemClassProperty, ConfigItemClass,
    KIXObjectType, SortUtil, DataType, SortOrder
} from '../../../../core/model';
import { AdminContext } from '../../../../core/browser/admin';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.eventSubscriberId = 'ticket-admin-ci-classes';
    }

    public async onMount(): Promise<void> {
        this.state.predefinedTableFilter = [
            new KIXObjectPropertyFilter('Gültig', [
                new TableFilterCriteria(ConfigItemClassProperty.VALID_ID, SearchOperator.EQUALS, 1, false
                )]
            ),
            new KIXObjectPropertyFilter('Ungültig', [
                new TableFilterCriteria(ConfigItemClassProperty.VALID_ID, SearchOperator.EQUALS, 2, false
                )]
            ),
            new KIXObjectPropertyFilter('Temporär ungültig', [
                new TableFilterCriteria(ConfigItemClassProperty.VALID_ID, SearchOperator.EQUALS, 3, false)
            ])
        ];

        this.prepareActions();

        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null, null, null, false
        );
        await this.prepareTitle(ciClasses.length);
        await this.prepareTable(ciClasses);

        EventService.getInstance().subscribe('CMDB_CONFIG_ITEM_CLASS_LIST_UPDATED', this);
    }

    private async prepareTitle(count: number): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_CLASS);
        const className = labelProvider.getObjectName(true);
        this.state.title = `${context.categoryName}: ${className} (${count})`;
    }

    private async prepareTable(ciClasses: ConfigItemClass[]): Promise<void> {
        const tableConfiguration = new TableConfiguration(null, null, null, null, true);
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            KIXObjectType.CONFIG_ITEM_CLASS, tableConfiguration, null, null, true
        );

        ciClasses = SortUtil.sortObjects(ciClasses, ConfigItemClassProperty.NAME, DataType.STRING, SortOrder.DOWN);

        table.layerConfiguration.contentLayer.setPreloadedObjects(ciClasses);
        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        await table.loadRows();
        this.state.table = table;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe('CMDB_CONFIG_ITEM_CLASS_LIST_UPDATED', this);
    }

    private prepareActions(): void {
        this.state.actions = ActionFactory.getInstance().generateActions(
            [
                'cmdb-admin-ci-class-create', 'cmdb-admin-ci-class-import', 'csv-export-action'
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
        if (eventId === 'CMDB_CONFIG_ITEM_CLASS_LIST_UPDATED') {
            const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(KIXObjectType.CONFIG_ITEM_CLASS);
            await this.prepareTitle(ciClasses.length);
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(ciClasses);
            await this.state.table.loadRows();
            this.state.table.listenerConfiguration.selectionListener.updateSelections(
                this.state.table.getTableRows(true)
            );
        }
    }
}

module.exports = Component;
