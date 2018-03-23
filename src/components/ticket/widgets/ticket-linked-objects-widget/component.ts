import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import {
    LinkedTicketTableContentLayer,
    TicketService,
    TicketTableLabelLayer,
    TicketTableClickListener
} from '@kix/core/dist/browser/ticket';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { LinkedObjectsWidgetComponentState } from './LinkedObjectsWidgetComponentState';
import { Link, Ticket } from '@kix/core/dist/model';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import {
    TableColumnConfiguration, StandardTable,
    ITableConfigurationListener, TableSortLayer, TableColumn, TableRowHeight, ActionFactory
} from '@kix/core/dist/browser';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import { IdService } from '@kix/core/dist/browser/IdService';

class LinkedObjectsWidgetComponent {

    private state: LinkedObjectsWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new LinkedObjectsWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
        this.setLinkedObjects();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();

        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration<LinkedObjectsSettings>(this.state.instanceId)
            : undefined;

        this.setLinkedObjects();
        this.setActions();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.setLinkedObjects();
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, this.state.ticket
            );
        }
    }

    private setLinkedObjects(): void {
        this.state.linkedObjectGroups = [];
        this.state.linkCount = 0;

        if (this.state.ticketId) {
            this.state.ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (this.state.ticket) {

                const linkedTickets = this.state.ticket.Links.filter((link) => {
                    return (link.SourceObject === 'Ticket' && link.SourceKey !== this.state.ticketId.toString()) ||
                        (link.TargetObject === 'Ticket' && link.TargetKey !== this.state.ticketId.toString());
                });

                if (linkedTickets.length) {
                    const ticketTableConfiguration = this.getTicketTableConfiguration(linkedTickets);
                    this.state.linkCount += linkedTickets.length;
                    this.state.linkedObjectGroups.push(['Ticket', linkedTickets.length, ticketTableConfiguration]);
                }
            }
        }
    }

    private getTicketTableConfiguration(linkedTickets: Link[]): StandardTable<Ticket> {
        if (this.state.widgetConfiguration) {
            const labelProvider = new TicketTableLabelLayer();

            const groupEntry = this.state.widgetConfiguration.settings.groups.find((g) => g[0] === "Ticket");
            const columnConfig = groupEntry ? groupEntry[1] : [];

            const contentProvider = new LinkedTicketTableContentLayer(
                this.state.instanceId, this.state.ticketId, linkedTickets
            );

            const clickListener = new TicketTableClickListener();
            const configurationListener: ITableConfigurationListener<Ticket> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            return new StandardTable(
                IdService.generateDateBasedRandomId(),
                contentProvider,
                labelProvider,
                [],
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

    private columnConfigurationChanged(column: TableColumn): void {
        const groupEntry = this.state.widgetConfiguration.settings.groups.find((g) => g[0] === "Ticket");
        if (groupEntry) {
            const index = groupEntry[1].findIndex((tc) => tc.columnId === column.id);

            if (index >= 0) {
                groupEntry[1][index].size = column.size;
                DashboardService.getInstance().saveWidgetConfiguration(
                    this.state.instanceId, this.state.widgetConfiguration
                );
            }
        }
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
    }

    private getTemplate(componentId: string): any {
        return ClientStorageService.getComponentTemplate(componentId);
    }

    private getGroupTitle(group: any): string {
        return group[0] + ' (' + group[1] + ')';
    }
}

module.exports = LinkedObjectsWidgetComponent;
