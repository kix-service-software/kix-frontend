import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import {
    LinkedTicketTableContentProvider,
    TicketUtil,
    TicketService,
    TicketData,
    TicketTableLabelProvider
} from '@kix/core/dist/browser/ticket';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { LinkedObjectsWidgetComponentState } from './LinkedObjectsWidgetComponentState';
import { TicketDetails, TicketProperty, Link } from '@kix/core/dist/model';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { StandardTableColumn, StandardTableConfiguration } from '@kix/core/dist/browser';

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
                    this.setTicketTableConfiguration(linkedTickets);
                    this.state.linkCount += linkedTickets.length;
                    this.state.linkedObjectGroups.push(['Ticket', linkedTickets.length]);
                }
            }
        }
    }

    private setTicketTableConfiguration(linkedTickets: Link[]): void {
        if (this.state.widgetConfiguration) {
            const labelProvider = new TicketTableLabelProvider();

            const columnConfig: StandardTableColumn[] = [
                new StandardTableColumn('TicketNumber', '', true, true, false),
                new StandardTableColumn('Title', '', true, true, false),
                new StandardTableColumn('TypeID', '', true, true, false),
                new StandardTableColumn('QueueID', '', true, true, false),
                new StandardTableColumn('StateID', 'TicketState', true, false, true),
                new StandardTableColumn('Created', '', true, true, false),
                new StandardTableColumn('LinkedAs', 'LinkedAs', false, true, false)
            ];

            const contentProvider = new LinkedTicketTableContentProvider(
                this.state.instanceId, this.state.ticketId, linkedTickets, 5, columnConfig
            );

            this.state.ticketTableConfiguration = new StandardTableConfiguration(
                labelProvider, contentProvider, null
            );
        }
    }

    private getDateTimeString(date: string): string {
        return TicketUtil.getDateTimeString(date);
    }

    private ticketClicked(ticketId: string, event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        ComponentRouterStore.getInstance().navigate('base-router', 'ticket-details', { ticketId }, ticketId);
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
