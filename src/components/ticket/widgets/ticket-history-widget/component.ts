import { ContextService } from '@kix/core/dist/browser/context';
import {
    HistoryTableLabelLayer, HistoryTableContentLayer
} from '@kix/core/dist/browser/ticket';
import { TicketHistoryComponentState } from './TicketHistoryComponentState';
import {
    StandardTable, ITableClickListener, ITableConfigurationListener, TableColumn,
    ActionFactory, TableLayerConfiguration, TableListenerConfiguration,
} from '@kix/core/dist/browser';
import { TicketHistory, ArticleProperty, KIXObjectType, ContextMode, Ticket } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';
import { EventService } from '@kix/core/dist/browser/event';

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

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('ticket-history-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            }
        });

        await this.initWidget(await context.getObject<Ticket>());
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.ticket = ticket;
        this.setActions();
        this.setHistoryTableConfiguration();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticket]
            );
        }
    }

    private setHistoryTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const contentLayer = new HistoryTableContentLayer(this.state.ticket);
            const labelLayer = new HistoryTableLabelLayer();
            const layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);

            const clickListener: ITableClickListener<TicketHistory> = {
                rowClicked: this.navigateToArticle.bind(this)
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

    private navigateToArticle(historyEntry: TicketHistory, columnId: string): void {
        if (columnId === ArticleProperty.ARTICLE_ID && historyEntry[columnId]) {
            EventService.getInstance().publish('GotToTicketArticle', historyEntry[columnId]);
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
