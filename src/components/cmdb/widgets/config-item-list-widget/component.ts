import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, SearchOperator, WidgetService, ServiceRegistry, TableFactoryService, TableEvent
} from "../../../../core/browser";
import {
    KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria, KIXObject, ConfigItemProperty
} from "../../../../core/model";
import { CMDBContext, CMDBService } from "../../../../core/browser/cmdb";
import { EventService } from "../../../../core/browser/event";

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

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, {
            eventSubscriberId: 'customer-list-widget' + this.state.instanceId,
            eventPublished: (data: any, eventId: string) => {
                if (eventId === TableEvent.TABLE_READY && data === this.state.table.getTableId()) {
                    this.prepareTitle();
                    this.setActionsDirty();
                }
            }
        });

        await this.prepareTable();
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
        const table =
            TableFactoryService.getInstance().createTable(
                KIXObjectType.CONFIG_ITEM, null, null, CMDBContext.CONTEXT_ID
            );

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.state.table = table;
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private prepareTitle(): void {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${this.state.table.getRows().length})`;
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

            await this.state.table.setFilter(textFilterValue, newFilter ? newFilter.criteria : null);
            this.state.table.filter();

            const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
            const rows = this.state.table.getRows();
            context.setFilteredObjectList(rows.map((r) => r.getRowObject().getObject()));
        }
    }

    private async contextObjectListChanged(objectList: KIXObject[]): Promise<void> {
        if (this.state.table) {
            this.prepareTitle();
            const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
            context.setFilteredObjectList(objectList);
        }
    }

}

module.exports = Component;
