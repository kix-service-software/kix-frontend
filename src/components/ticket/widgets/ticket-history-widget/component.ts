import { ContextService } from '@kix/core/dist/browser/context';
import {
    HistoryTableLabelLayer, HistoryTableContentLayer, TicketDetailsContext, TicketService
} from '@kix/core/dist/browser/ticket';
import { TicketHistoryComponentState } from './TicketHistoryComponentState';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import {
    TableColumnConfiguration, StandardTable, ITableClickListener,
    ITableConfigurationListener,
    TableSortLayer,
    TableColumn,
    TableFilterLayer,
    TableToggleLayer,
    ActionFactory
} from '@kix/core/dist/browser';
import { TicketHistory, ArticleProperty } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

class TicketHistoryWidgetComponent {

    private state: TicketHistoryComponentState;

    public onCreate(input: any): void {
        this.state = new TicketHistoryComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
        this.setHistoryTableConfiguration();
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        context.registerListener({
            objectChanged: () => (objectId: string | number, object: any) => {
                if (objectId === this.state.ticketId) {
                    this.setHistoryTableConfiguration();
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; }
        });

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.setActions();
        this.setHistoryTableConfiguration();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                this.state.actions = ActionFactory.getInstance().generateActions(
                    this.state.widgetConfiguration.actions, false, ticket
                );
            }
        }
    }

    private setHistoryTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const labelProvider = new HistoryTableLabelLayer();

            const columnConfig: TableColumnConfiguration[] = this.state.widgetConfiguration.settings.tableColumns || [];

            const contentProvider = new HistoryTableContentLayer(this.state.instanceId, this.state.ticketId);

            const clickListener: ITableClickListener<TicketHistory> = {
                rowClicked: this.navigateToArticle.bind(this)
            };

            const configurationListener: ITableConfigurationListener<TicketHistory> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                contentProvider,
                labelProvider,
                [new TableFilterLayer()],
                [new TableSortLayer()],
                null,
                null,
                null,
                columnConfig,
                null,
                clickListener,
                configurationListener,
                7
            );
        }
    }

    private navigateToArticle(historyEntry: TicketHistory, columnId: string): void {
        if (columnId === ArticleProperty.ARTICLE_ID && historyEntry[columnId]) {
            // FIXME: GO_TO_ARTICLE
            // ContextService.getInstance().notifyListener(
            //     TicketDetailsContext.CONTEXT_ID, ContextNotification.GO_TO_ARTICLE, historyEntry[columnId]
            // );
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
        }

        ContextService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.widgetConfiguration);
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.standardTable.setFilterSettings(filterValue);
    }

}

module.exports = TicketHistoryWidgetComponent;
