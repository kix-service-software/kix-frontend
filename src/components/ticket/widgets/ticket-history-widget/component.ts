import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { HistoryTableLabelLayer, HistoryTableContentLayer } from '@kix/core/dist/browser/ticket';
import { TicketHistoryComponentState } from './TicketHistoryComponentState';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import {
    TableColumnConfiguration, StandardTable, ITableClickListener,
    ITableConfigurationListener,
    TableSortLayer,
    TableColumn,
    TableFilterLayer
} from '@kix/core/dist/browser';
import { TicketHistory } from '@kix/core/dist/model';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';

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
                contentProvider,
                labelProvider,
                [new TableFilterLayer()],
                [new TableSortLayer()],
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
            (this as any).emit('expandArticle', historyEntry[columnId]);
            const articleElement = document.getElementById(historyEntry[columnId].toString());
            articleElement.scrollIntoView();
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

    private filterValueChanged(event: any): void {
        this.state.filterValue = event.target.value;
    }

    private filterHistory(): void {
        if (this.state.filterValue !== null && this.state.filterValue !== "") {
            this.state.standardTable.setFilterSettings(this.state.filterValue);
        } else {
            this.state.standardTable.resetFilter();
        }
    }

    private print(): void {
        ApplicationStore.getInstance().toggleMainDialog();
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }

}

module.exports = TicketHistoryWidgetComponent;
