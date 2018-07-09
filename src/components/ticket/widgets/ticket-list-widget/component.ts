import { TicketListComponentState } from './TicketListComponentState';
import { Ticket, KIXObjectPropertyFilter, KIXObjectType } from '@kix/core/dist/model/';
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TicketTableContentLayer, TicketTableLabelLayer, TicketTableClickListener
} from '@kix/core/dist/browser/ticket/';
import {
    ITableConfigurationListener, TableSortLayer, TableColumn, TableFilterLayer,
    ActionFactory, TableToggleLayer, TableRow, ITableToggleListener,
    StandardTableFactoryService, TableLayerConfiguration, TableListenerConfiguration, WidgetService
} from '@kix/core/dist/browser';

class TicketListWidgetComponent implements ITableToggleListener {


    public state: TicketListComponentState;

    public onCreate(): void {
        this.state = new TicketListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'Tickets';
        this.state.predefinedTableFilter = this.state.widgetConfiguration ?
            this.state.widgetConfiguration.predefinedTableFilters : [];

        this.setTableConfiguration();
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.generalTicketActions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.actions, true);

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.generalTicketActions);
        }
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {

            const tableConfiguration = this.state.widgetConfiguration.settings;

            const layerConfiguration = new TableLayerConfiguration(
                new TicketTableContentLayer(
                    null, tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
                ),
                new TicketTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                new TableToggleLayer(this, false)
            );

            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(
                new TicketTableClickListener(), null, configurationListener
            );

            this.state.standardTable = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.TICKET, tableConfiguration, layerConfiguration, listenerConfiguration
            );

            this.state.standardTable.setTableListener(() => {
                this.state.title = this.getTitle();
            });

            this.filter();
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

    private filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        this.state.standardTable.setFilterSettings(textFilterValue, filter);
    }

    private getTitle(): string {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.standardTable) {
            title = `${title} (${this.state.standardTable.getTableRows(true).length})`;
        }
        return title;
    }

    // Toggle Listener
    public rowToggled(row: TableRow<Ticket>, rowIndex: number, tableId: string): void {
        console.log('row toggled');
    }

}

module.exports = TicketListWidgetComponent;
