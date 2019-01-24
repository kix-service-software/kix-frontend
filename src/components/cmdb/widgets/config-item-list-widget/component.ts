import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, StandardTableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, SearchOperator, WidgetService, ServiceRegistry
} from "../../../../core/browser";
import {
    KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria, KIXObject, ConfigItemClass, ConfigItemProperty
} from "../../../../core/model";
import { CMDBContext, CMDBService } from "../../../../core/browser/cmdb";

class Component {

    private state: ComponentState;

    private predefinedFilter: KIXObjectPropertyFilter;
    private textFilterValue: string;
    private additionalFilterCriteria: TableFilterCriteria[] = [];

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.additionalFilterCriteria = [];
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration.contextDependent) {
            context.registerListener('config-item-list-context-listener', {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: this.contextObjectListChanged.bind(this),
                filteredObjectListChanged: () => { return; }
            });
        }

        this.prepareFilter();
        this.prepareActions();
        await this.prepareTable();

        this.state.loading = false;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async prepareFilter(): Promise<void> {
        const service = ServiceRegistry.getServiceInstance<CMDBService>(
            KIXObjectType.CONFIG_ITEM
        );

        const deploymentStates = await service.getDeploymentStates();
        const filter = this.state.widgetConfiguration.predefinedTableFilters;
        deploymentStates.forEach(
            (ds) => filter.push(new KIXObjectPropertyFilter(ds.Name, [
                new TableFilterCriteria(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.EQUALS, ds.ItemID
                )
            ])));

        this.state.predefinedTableFilter = filter;
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private async prepareTable(): Promise<void> {
        const tableConfiguration = new TableConfiguration(
            null, null, null, null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );

        const table =
            StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CONFIG_ITEM, tableConfiguration, null, null, true, true
            );

        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        table.layerConfiguration.contentLayer.setPreloadedObjects([]);
        this.state.table = table;

        this.state.table.setTableListener(() => {
            this.state.filterCount = this.state.table.getTableRows(true).length || 0;
            (this as any).setStateDirty('filterCount');
        });

        const context = ContextService.getInstance().getActiveContext();
        if (this.state.widgetConfiguration.contextDependent && context) {
            const objects = await context.getObjectList();
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
            this.setTitle(objects.length);
            await this.state.table.loadRows();
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private setTitle(count: number = 0): void {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${count})`;
        }
        this.state.title = title;
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            this.predefinedFilter = filter;
            this.textFilterValue = textFilterValue;

            const name = this.predefinedFilter ? this.predefinedFilter.name : null;
            const predefinedCriteria = this.predefinedFilter ? this.predefinedFilter.criteria : [];
            const newFilter = new KIXObjectPropertyFilter(
                name, [...predefinedCriteria, ...this.additionalFilterCriteria]
            );

            await this.state.table.setFilterSettings(textFilterValue, newFilter);

            const context = ContextService.getInstance().getActiveContext();
            const rows = this.state.table.getTableRows();
            context.setFilteredObjectList(rows.map((r) => r.object));
        }
    }

    private async contextObjectListChanged(objectList: KIXObject[]): Promise<void> {
        if (this.state.table) {
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(objectList);
            this.setTitle(objectList.length);
            await this.state.table.loadRows();

            const context = ContextService.getInstance().getActiveContext();
            context.setFilteredObjectList(objectList);
        }
    }

    private setConfigItemClassFilter(configItemClass: ConfigItemClass): void {
        this.additionalFilterCriteria = [];

        if (configItemClass) {
            this.additionalFilterCriteria = [
                new TableFilterCriteria(ConfigItemProperty.CLASS_ID, SearchOperator.EQUALS, configItemClass.ID)
            ];
        }

        if (!this.predefinedFilter) {
            this.predefinedFilter = new KIXObjectPropertyFilter('Config Item Klasse', []);
        }

        this.filter(this.textFilterValue, this.predefinedFilter);
    }

}

module.exports = Component;
