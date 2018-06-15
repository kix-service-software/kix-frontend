import { TicketListComponentState } from './TicketListComponentState';
import {
    ContextFilter,
    Context,
    ObjectType,
    Ticket,
    TicketState,
    TicketProperty
} from '@kix/core/dist/model/';
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TicketService,
    TicketTableContentLayer,
    TicketTableLabelLayer,
    TicketTableSelectionListener,
    TicketTableClickListener
} from '@kix/core/dist/browser/ticket/';
import {
    TableColumnConfiguration, StandardTable, TableRowHeight, ITableConfigurationListener,
    TableSortLayer, TableColumn, TableFilterLayer, ToggleOptions, TableHeaderHeight, ActionFactory
} from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';
import { TicketListSettings } from './TicketListSettings';

class TicketListWidgetComponent {

    public state: TicketListComponentState;

    private componentInitialized: boolean = false;

    public onCreate(input: any): void {
        this.state = new TicketListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, context: Context<any>) => {
                this.state.widgetConfiguration =
                    context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
                this.setTableConfiguration();
            }
        });
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

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
                new TicketTableContentLayer(this.state.instanceId, null, filter, 100),
                new TicketTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                null,
                null,
                null,
                this.state.widgetConfiguration.settings.tableColumns || [],
                new TicketTableSelectionListener(),
                new TicketTableClickListener(),
                configurationListener,
                this.state.widgetConfiguration.settings.displayLimit,
                true,
                TableRowHeight.LARGE,
                TableHeaderHeight.LARGE,
                false,
                new ToggleOptions('ticket-article-details', 'article')
            );

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

    private filter(filterValue?: string): void {
        if (filterValue !== null && filterValue !== "") {
            this.state.standardTable.setFilterSettings(filterValue);
        } else {
            this.state.standardTable.resetFilter();
        }
    }

}

module.exports = TicketListWidgetComponent;
