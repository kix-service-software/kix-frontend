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
import { TicketDetails, TicketProperty } from '@kix/core/dist/model';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { StandardTableColumn, StandardTableConfiguration } from '@kix/core/dist/browser';

class LinkedObjectsWidgetComponent {

    private state: LinkedObjectsWidgetComponentState;

    private loadLinkedTickets: number = 0;

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
        this.setTicketData();
        this.setLinkedObjects();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.setLinkedObjects();
        }
        if (id === TicketService.TICKET_DATA_ID && type === ContextNotification.OBJECT_UPDATED) {
            this.setTicketData();
        }
    }

    private setTicketData(): void {
        const ticketData = ContextService.getInstance().getObject<TicketData>(TicketService.TICKET_DATA_ID);
        if (ticketData) {
            this.state.ticketData = ticketData;
        }
    }

    // TODO: generischer aufbauen
    private setLinkedObjects(): void {
        this.state.linkQuantity = 0;
        // FIXME: nur temporär, andere Lösung finden
        this.loadLinkedTickets = 0;
        if (this.state.ticketId) {
            this.state.ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (this.state.ticketDetails && this.state.ticketData) {
                this.state.ticketDetails.ticket.Links.forEach((link) => {
                    let linkedObjectType;
                    let linkedObjectKey;
                    let linkedObjectLinkType;
                    if (link.SourceObject !== 'Ticket' || link.SourceKey !== this.state.ticketId.toString()) {
                        linkedObjectKey = link.SourceKey;
                        linkedObjectType = link.SourceObject;
                        const linkType = this.state.ticketData.linkTypes.find((lt) => lt.Name === link.Type);
                        if (linkType) {
                            linkedObjectLinkType = linkType.SourceName;
                        }
                    } else if (link.TargetObject !== 'Ticket' || link.TargetKey !== this.state.ticketId.toString()) {
                        linkedObjectKey = link.TargetKey;
                        linkedObjectType = link.TargetObject;
                        const linkType = this.state.ticketData.linkTypes.find((lt) => lt.Name === link.Type);
                        if (linkType) {
                            linkedObjectLinkType = linkType.TargetName;
                        }
                    }
                    if (linkedObjectType && linkedObjectKey && linkedObjectLinkType) {
                        if (!this.state.linkedObjects.has(linkedObjectType)) {
                            this.state.linkedObjects.set(linkedObjectType, new Map());
                        }
                        if (linkedObjectType === 'Ticket') {
                            this.loadLinkedTickets++;
                            TicketService.getInstance().loadTicketDetails(Number(linkedObjectKey)).then(() => {
                                const linkedTicketDetails
                                    = TicketService.getInstance().getTicketDetails(Number(linkedObjectKey));
                                // TODO: Alternative finden (neuer LinkedTicketTableLabelProvider?)
                                linkedTicketDetails.ticket['LinkedAs'] = linkedObjectLinkType;
                                this.state.linkedObjects.get(linkedObjectType)
                                    .set(linkedTicketDetails.ticket, linkedObjectLinkType);
                                this.state.linkQuantity++;
                                this.loadLinkedTickets--;
                                this.allTicketsLoaded();
                            });
                        }
                    }
                });
            }
        }
    }

    private allTicketsLoaded(): void {
        if (this.loadLinkedTickets === 0) {
            this.setTicketTableConfiguration();
            (this as any).setStateDirty("linkedObjects");
        }
    }

    private setTicketTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const labelProvider = new TicketTableLabelProvider();

            const columnConfig: StandardTableColumn[] = [];
            for (const prop of ['TicketNumber', 'Title', 'TypeID', 'QueueID', 'StateID', 'Created', 'LinkedAs']) {
                if (prop === TicketProperty.PRIORITY_ID) {
                    columnConfig.push(new StandardTableColumn(prop, 'Priority', true, false, true));
                } else if (prop === TicketProperty.STATE_ID) {
                    columnConfig.push(new StandardTableColumn(prop, 'TicketState', true, false, true));
                } else if (prop === TicketProperty.SERVICE_ID) {
                    columnConfig.push(new StandardTableColumn(prop, 'IncidentState', true, true, true));
                } else if (prop === TicketProperty.LOCK_ID) {
                    columnConfig.push(new StandardTableColumn(prop, 'TicketLock', true, false, true));
                } else if (prop === 'LinkedAs') {
                    columnConfig.push(new StandardTableColumn(prop, 'LinkedAs', false, true, false));
                } else {
                    columnConfig.push(new StandardTableColumn(prop, '', true, true, false));
                }
            }

            const contentProvider = new LinkedTicketTableContentProvider(
                this.state.instanceId,
                Array.from(this.state.linkedObjects.get('Ticket').keys()),
                5,
                columnConfig
            );

            this.state.ticketTableConfiguration = new StandardTableConfiguration(
                labelProvider, contentProvider, null
            );
        }
    }

    private getLinkQuantity(objectGroup: string): number {
        return this.state.linkedObjects.get(objectGroup) ? this.state.linkedObjects.get(objectGroup).size : 0;
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
