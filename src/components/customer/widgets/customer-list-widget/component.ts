import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    TableRowHeight, StandardTable, IdService, TableSortLayer, TableFilterLayer
} from "@kix/core/dist/browser";
import { WidgetConfiguration, Customer } from "@kix/core/dist/model";
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
        const currentContext = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.actions = ActionFactory.getInstance().generateActions(
            this.state.widgetConfiguration.actions, true, null
        );

        this.setTableConfiguration();
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {

            const configurationListener: ITableConfigurationListener<Customer> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                new CustomerTableContentLayer(this.state.instanceId),
                new CustomerTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                null, null, null,
                this.state.widgetConfiguration.settings.tableColumns || [],
                null, null,
                configurationListener,
                this.state.widgetConfiguration.settings.displayLimit,
                false,
                TableRowHeight.SMALL,
                false
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

}

module.exports = Component;
