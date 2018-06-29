import { TicketListComponentState } from './TicketListComponentState';
import {
    Context,
    Ticket,
    KIXObjectPropertyFilter,
} from '@kix/core/dist/model/';
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TicketTableContentLayer,
    TicketTableLabelLayer,
    TicketTableSelectionListener,
    TicketTableClickListener
} from '@kix/core/dist/browser/ticket/';
import {
    StandardTable, TableRowHeight, ITableConfigurationListener,
    TableSortLayer, TableColumn, TableFilterLayer, ToggleOptions,
    TableHeaderHeight, ActionFactory, TableToggleLayer, ITableToggleLayer, TableRow, ITableToggleListener
} from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';
import { TicketListSettings } from './TicketListSettings';

class TicketListWidgetComponent implements ITableToggleListener<Ticket> {


    public state: TicketListComponentState;

    public onCreate(input: any): void {
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
        }
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {

            const configurationListener: ITableConfigurationListener<Ticket> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            const tableSettings = (this.state.widgetConfiguration.settings as TicketListSettings);

            const filter = tableSettings.filter && tableSettings.filter.length ? tableSettings.filter : null;

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                new TicketTableContentLayer(null, filter, tableSettings.sortOrder, tableSettings.limit),
                new TicketTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                new TableToggleLayer(this, false),
                null,
                null,
                this.state.widgetConfiguration.settings.tableColumns || [],
                new TicketTableSelectionListener(),
                new TicketTableClickListener(),
                configurationListener,
                this.state.widgetConfiguration.settings.displayLimit,
                true,
                tableSettings.rowHeight ? tableSettings.rowHeight : TableRowHeight.LARGE,
                tableSettings.headerHeight ? tableSettings.headerHeight : TableHeaderHeight.LARGE,
                tableSettings.toggleOptions ? true : false,
                tableSettings.toggleOptions
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
