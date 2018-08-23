import { ContextService } from '@kix/core/dist/browser/context';
import { LinkedTicketTableContentLayer, TicketTableLabelLayer } from '@kix/core/dist/browser/ticket';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { ComponentState } from './ComponentState';
import { Link, Ticket, WidgetType, KIXObjectType } from '@kix/core/dist/model';
import {
    StandardTable, ITableConfigurationListener, TableSortLayer, TableColumn,
    ActionFactory, WidgetService, TableListenerConfiguration, TableLayerConfiguration, StandardTableFactoryService
} from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';

class Component {

    private state: ComponentState;
    private contextListernerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListernerId = IdService.generateDateBasedId('ticket-linked-objects-');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
        this.setLinkedObjects();
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener(this.contextListernerId, {
            objectChanged: (id: string | number, object: Ticket) => {
                if (id === this.state.ticketId) {
                    this.state.ticket = object;
                    this.setLinkedObjects();
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration<LinkedObjectsSettings>(this.state.instanceId)
            : undefined;

        WidgetService.getInstance().setWidgetType('ticket-linked-objects', WidgetType.GROUP);

        context.registerListener('ticket-dynamic-fields-widget', {
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
        this.setLinkedObjects();
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.ticket]
            );
        }
    }

    private setLinkedObjects(): void {
        this.state.linkedObjectGroups = [];
        this.state.linkCount = 0;

        if (this.state.ticket) {
            const linkedTickets = this.state.ticket.Links.filter((link) => {
                return (link.SourceObject === KIXObjectType.TICKET &&
                    link.SourceKey !== this.state.ticketId.toString()) ||
                    (link.TargetObject === KIXObjectType.TICKET &&
                        link.TargetKey !== this.state.ticketId.toString());
            });

            if (linkedTickets.length) {
                const ticketTableConfiguration = this.getTicketTableConfiguration(linkedTickets);
                this.state.linkCount += linkedTickets.length;
                this.state.linkedObjectGroups.push([
                    KIXObjectType.TICKET, linkedTickets.length, ticketTableConfiguration
                ]);
            }
        }
    }

    private getTicketTableConfiguration(linkedTickets: Link[]): StandardTable<Ticket> {
        if (this.state.widgetConfiguration) {
            const groupEntry = this.state.widgetConfiguration.settings.groups.find(
                (g) => g[0] === KIXObjectType.TICKET
            );
            const tableConfiguration = groupEntry ? groupEntry[1] : null;

            const contentLayer = new LinkedTicketTableContentLayer(
                this.state.instanceId, this.state.ticketId, linkedTickets
            );
            const labelLayer = new TicketTableLabelLayer();
            const layerConfiguration = new TableLayerConfiguration(
                contentLayer, labelLayer, [], [new TableSortLayer()]
            );

            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            return StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.TICKET, tableConfiguration, layerConfiguration, listenerConfiguration, true
            );
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const groupEntry = this.state.widgetConfiguration.settings.groups.find((g) => g[0] === KIXObjectType.TICKET);
        if (groupEntry) {
            const index = groupEntry[1].tableColumns.findIndex((tc) => tc.columnId === column.id);

            if (index >= 0) {
                groupEntry[1][index].size = column.size;
                ContextService.getInstance().saveWidgetConfiguration(
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
        return ComponentsService.getInstance().getComponentTemplate(componentId);
    }

    private getGroupTitle(group: any): string {
        return group[0] + ' (' + group[1] + ')';
    }
}

module.exports = Component;
