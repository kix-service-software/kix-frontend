import { ComponentState } from './ComponentState';
import {
    KIXObjectPropertyFilter, KIXObjectType, KIXObject, TableFilterCriteria, Context, ContextType
} from '../../../../core/model/';
import { ContextService } from "../../../../core/browser/context";
import {
    TicketTableContentLayer, TicketTableLabelLayer
} from '../../../../core/browser/ticket/';
import {
    ITableConfigurationListener, TableSortLayer, TableColumn, TableFilterLayer,
    ActionFactory, TableToggleLayer, StandardTableFactoryService, TableLayerConfiguration,
    TableListenerConfiguration, WidgetService, IdService, TableEvents, TableEventData, StandardTable
} from '../../../../core/browser';
import { IEventSubscriber, EventService } from '../../../../core/browser/event';

class Component implements IEventSubscriber {

    public state: ComponentState;
    public eventSubscriberId: string;

    private predefinedFilter: KIXObjectPropertyFilter;
    private textFilterValue: string;
    private additionalFilterCriteria: TableFilterCriteria[] = [];

    public onCreate(): void {
        this.state = new ComponentState();
        this.eventSubscriberId = IdService.generateDateBasedId('ticket-list-');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.additionalFilterCriteria = [];
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'Übersicht Tickets';
        this.state.predefinedTableFilter = this.state.widgetConfiguration ?
            this.state.widgetConfiguration.predefinedTableFilters : [];

        if (this.state.widgetConfiguration.contextDependent) {
            context.registerListener('faq-article-list-context-listener', {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: this.contextObjectListChanged.bind(this),
                filteredObjectListChanged: () => { return; }
            });
        }

        this.prepareActions();
        await this.setTableConfiguration();
        EventService.getInstance().subscribe(TableEvents.REFRESH, this);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvents.REFRESH, this);
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
        }
    }

    private async setTableConfiguration(): Promise<void> {
        if (this.state.widgetConfiguration) {

            const tableConfiguration = this.state.widgetConfiguration.settings;

            const preloadedTickets = this.state.widgetConfiguration.contextDependent ? [] : null;

            const layerConfiguration = new TableLayerConfiguration(
                new TicketTableContentLayer(
                    preloadedTickets, tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
                ),
                new TicketTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                new TableToggleLayer(null, false)
            );

            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(null, null, configurationListener);

            const table = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.TICKET, tableConfiguration, layerConfiguration, listenerConfiguration, true
            );

            table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

            WidgetService.getInstance().setActionData(this.state.instanceId, table);

            table.setTableListener(() => {
                this.state.filterCount = this.state.table.getTableRows(true).length || 0;
                (this as any).setStateDirty('filterCount');
            });

            this.state.table = table;
            await this.prepareTable();
        }
    }

    private async prepareTable(reload: boolean = false): Promise<void> {
        if (this.state.widgetConfiguration.contextDependent) {
            const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
            if (context) {
                const objects = await context.getObjectList(reload);
                this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
            }
        }
        await this.state.table.loadRows(reload);
        const rows = this.state.table.getTableRows(true);
        this.state.table.listenerConfiguration.selectionListener.updateSelections(rows);
        this.setTitle(this.state.table.getTableRows(true).length);
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
            ContextService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            this.predefinedFilter = filter;
            this.textFilterValue = textFilterValue;

            const name = filter ? filter.name : null;
            const predefinedCriteria = filter ? filter.criteria : [];
            const newFilter = new KIXObjectPropertyFilter(
                name, [...predefinedCriteria, ...this.additionalFilterCriteria]
            );

            await this.state.table.setFilterSettings(textFilterValue, newFilter);

            const context = ContextService.getInstance().getActiveContext();
            const rows = this.state.table.getTableRows();
            context.setFilteredObjectList(rows.map((r) => r.object));
        }
    }

    private setTitle(count: number = 0): void {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${count})`;
        }
        this.state.title = title;
    }

    private async contextObjectListChanged(objectList: KIXObject[]): Promise<void> {
        if (this.state.table) {
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(objectList);
            this.setTitle(objectList.length);

            await this.state.table.loadRows();

            const rows = this.state.table.getTableRows(true);
            this.state.table.listenerConfiguration.selectionListener.updateSelections(rows);

            const context = ContextService.getInstance().getActiveContext();
            context.setFilteredObjectList(objectList);
        }
    }

    public async eventPublished(data: TableEventData, eventId: string): Promise<void> {
        if (data && data.tableId === this.state.table.tableId && eventId === TableEvents.REFRESH) {
            // FIXME: sollte über ein Table-Refresh möglich sein, direkt über Tabelle, nicht über einbindendes Widget
            await this.prepareTable(true);
        }
    }

}

module.exports = Component;
