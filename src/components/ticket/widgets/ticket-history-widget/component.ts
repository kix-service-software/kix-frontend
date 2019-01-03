import { ContextService } from '../../../../core/browser/context';
import { ComponentState } from './ComponentState';
import {
    ITableClickListener, ActionFactory, TableListenerConfiguration, StandardTableFactoryService,
} from '../../../../core/browser';
import { TicketHistory, KIXObjectType, Ticket, TicketHistoryProperty } from '../../../../core/model';
import { EventService } from '../../../../core/browser/event';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
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
        this.state.loading = true;
        this.state.ticket = ticket;

        if (this.state.ticket) {
            this.setActions();
            this.prepareTable();
        }

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ticket]
            );
        }
    }

    private prepareTable(): void {
        const clickListener: ITableClickListener<TicketHistory> = {
            rowClicked: this.navigateToArticle.bind(this)
        };
        const listenerConfiguration = new TableListenerConfiguration(clickListener);
        const table = StandardTableFactoryService.getInstance().createStandardTable<TicketHistory>(
            KIXObjectType.TICKET_HISTORY, null, null, listenerConfiguration
        );
        if (table) {
            table.layerConfiguration.contentLayer.setPreloadedObjects(this.state.ticket.History);
            table.loadRows();

            this.state.standardTable = table;
            this.state.standardTable.setTableListener(() => {
                this.state.filterCount = this.state.standardTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('filterCount');
            });
        }
    }

    private navigateToArticle(historyEntry: TicketHistory, columnId: string): void {
        if (columnId === TicketHistoryProperty.ARTICLE_ID && historyEntry[columnId]) {
            EventService.getInstance().publish('GotToTicketArticle', historyEntry[columnId]);
        }
    }

    public filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        if (this.state.standardTable) {
            this.state.standardTable.setFilterSettings(filterValue);
        }
    }

}

module.exports = Component;
