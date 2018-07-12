import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    StandardTable, IdService, TableSortLayer, TableFilterLayer,
    TableLayerConfiguration, TableListenerConfiguration, WidgetService
} from "@kix/core/dist/browser";
import { Customer, KIXObjectType, ContextMode, KIXObjectPropertyFilter } from "@kix/core/dist/model";
import { CustomerTableContentLayer, CustomerTableLabelLayer } from "@kix/core/dist/browser/customer";

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

            const layerConfiguration = new TableLayerConfiguration(
                new CustomerTableContentLayer(), new CustomerTableLabelLayer(),
                [new TableFilterLayer()], [new TableSortLayer()]
            );

            const clickListener = {
                rowClicked: (customer: Customer, columnId: string): void => {
                    ContextService.getInstance().setContext(
                        null, KIXObjectType.CUSTOMER, ContextMode.DETAILS, customer.CustomerID
                    );
                }
            };
            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(clickListener, null, configurationListener);

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                this.state.widgetConfiguration.settings, layerConfiguration, listenerConfiguration
            );
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
