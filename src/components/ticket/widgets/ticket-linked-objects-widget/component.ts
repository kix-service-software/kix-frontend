import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import {
    LinkedTicketTableContentProvider,
    TicketService,
    TicketTableLabelProvider,
    TicketTableClickListener
} from '@kix/core/dist/browser/ticket';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { LinkedObjectsWidgetComponentState } from './LinkedObjectsWidgetComponentState';
import { Link, Ticket } from '@kix/core/dist/model';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import {
    StandardTableColumn, StandardTable,
    ITableConfigurationListener, StandardTableSortLayer, TableColumn
} from '@kix/core/dist/browser';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';

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
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.setLinkedObjects();
        }
    }

    private setLinkedObjects(): void {
        this.state.linkedObjectGroups = [];
        this.state.linkCount = 0;

        if (this.state.ticketId) {
            this.state.ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (this.state.ticketDetails) {

                const linkedTickets = this.state.ticketDetails.ticket.Links.filter((link) => {
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
            const labelProvider = new TicketTableLabelProvider();

            const groupEntry = this.state.widgetConfiguration.settings.groups.find((g) => g[0] === "Ticket");
            const columnConfig = groupEntry ? groupEntry[1] : [];

            const contentProvider = new LinkedTicketTableContentProvider(
                this.state.instanceId, this.state.ticketId, linkedTickets
            );

            const clickListener = new TicketTableClickListener();
            const configurationListener: ITableConfigurationListener<Ticket> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            return new StandardTable(
                contentProvider,
                labelProvider,
                [],
                [new StandardTableSortLayer()],
                columnConfig,
                null,
                clickListener,
                configurationListener,
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
        return ClientStorageHandler.getComponentTemplate(componentId);
    }
}

module.exports = LinkedObjectsWidgetComponent;
