import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    StandardTable, IdService, TableSortLayer, TableFilterLayer,
    TableLayerConfiguration, TableListenerConfiguration, WidgetService, StandardTableFactoryService, AbstractTableLayer
} from "@kix/core/dist/browser";
import { Contact, KIXObjectType, ContextMode, KIXObjectPropertyFilter } from "@kix/core/dist/model";
import { ContactTableContentLayer, ContactTableLabelLayer } from "@kix/core/dist/browser/contact";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.actions = ActionFactory.getInstance().generateActions(
            this.state.widgetConfiguration.actions, true, null
        );
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);

        this.setTableConfiguration();
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            this.state.standardTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CONTACT, this.state.widgetConfiguration.settings,
                null, listenerConfiguration, true
            );
            this.state.standardTable.layerConfiguration.contentLayer.setPreloadedObjects(null);
            this.state.standardTable.loadRows();
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
            ContextService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    public filter(filterValue: string, filter: KIXObjectPropertyFilter): void {
        this.state.standardTable.setFilterSettings(filterValue, filter);
    }

}

module.exports = Component;
