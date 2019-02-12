import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    StandardTable, IdService, TableSortLayer, TableFilterLayer,
    TableLayerConfiguration, TableListenerConfiguration, WidgetService, StandardTableFactoryService, AbstractTableLayer
} from "../../../../core/browser";
import { Contact, KIXObjectType, ContextMode, KIXObjectPropertyFilter } from "../../../../core/model";
import { ContactTableContentLayer, ContactTableLabelLayer } from "../../../../core/browser/contact";

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
            this.state.widgetConfiguration.actions, null
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
                KIXObjectType.CONTACT, this.state.widgetConfiguration.settings,
                null, listenerConfiguration, true
            );
            this.state.standardTable.layerConfiguration.contentLayer.setPreloadedObjects(null);

            this.state.standardTable.listenerConfiguration.selectionListener.addListener(
                () => WidgetService.getInstance().updateActions(this.state.instanceId)
            );

            WidgetService.getInstance().setActionData(this.state.instanceId, this.state.standardTable);

            setTimeout(async () => {
                await this.state.standardTable.loadRows();
                this.state.title = this.getTitle();
                this.state.standardTable.setTableListener(() => {
                    this.state.filterCount = this.state.standardTable.getTableRows(true).length || 0;
                    (this as any).setStateDirty('filterCount');
                });
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

    private getTitle(): string {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.standardTable) {
            title = `${title} (${this.state.standardTable.getTableRows(true).length})`;
        }
        return title;
    }

    public filter(filterValue: string, filter: KIXObjectPropertyFilter): void {
        this.state.standardTable.setFilterSettings(filterValue, filter);
    }

}

module.exports = Component;
