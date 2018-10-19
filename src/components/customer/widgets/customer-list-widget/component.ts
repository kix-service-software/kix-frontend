import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    TableListenerConfiguration, WidgetService, StandardTableFactoryService
} from "@kix/core/dist/browser";
import { KIXObjectType, KIXObjectPropertyFilter } from "@kix/core/dist/model";

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

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            this.state.standardTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.CUSTOMER, this.state.widgetConfiguration.settings,
                null, listenerConfiguration, true
            );
            this.state.standardTable.layerConfiguration.contentLayer.setPreloadedObjects(null);
            setTimeout(async () => {
                await this.state.standardTable.loadRows();
                const rows = this.state.standardTable.getTableRows(true);
                this.state.title = this.state.widgetConfiguration.title + ` (${rows.length})`;
            }, 200);
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
