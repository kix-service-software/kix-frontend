import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { HistoryTableLabelLayer, HistoryTableContentLayer, TicketDetailsContext } from '@kix/core/dist/browser/ticket';
import { TicketHistoryComponentState } from './TicketHistoryComponentState';
import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import {
    TableColumnConfiguration, StandardTable, ITableClickListener,
    ITableConfigurationListener,
    TableSortLayer,
    TableColumn,
    TableFilterLayer,
    TableToggleLayer
} from '@kix/core/dist/browser';
import { TicketHistory } from '@kix/core/dist/model';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
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
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setHistoryTableConfiguration();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.setHistoryTableConfiguration();
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
                columnConfig,
                null,
                clickListener,
                configurationListener,
                7
            );
        }
    }

    private navigateToArticle(historyEntry: TicketHistory, columnId: string): void {
        if (columnId === 'ArticleID' && historyEntry[columnId]) {
            ContextService.getInstance().notifyListener(
                TicketDetailsContext.CONTEXT_ID, ContextNotification.GO_TO_ARTICLE, historyEntry[columnId]
            );
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
        }

        DashboardService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.widgetConfiguration);
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.standardTable.setFilterSettings(filterValue);
    }
    private print(): void {
        ApplicationService.getInstance().toggleMainDialog();
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }

}

module.exports = TicketHistoryWidgetComponent;
