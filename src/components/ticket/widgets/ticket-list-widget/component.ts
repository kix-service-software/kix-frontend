import { ComponentState } from './ComponentState';
import {
    KIXObjectPropertyFilter, KIXObjectType, KIXObject, TableFilterCriteria
} from '@kix/core/dist/model/';
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TicketTableContentLayer, TicketTableLabelLayer
} from '@kix/core/dist/browser/ticket/';
import {
    ITableConfigurationListener, TableSortLayer, TableColumn, TableFilterLayer,
    ActionFactory, TableToggleLayer, StandardTableFactoryService, TableLayerConfiguration,
    TableListenerConfiguration, WidgetService
} from '@kix/core/dist/browser';

class Component {

    public state: ComponentState;

    private predefinedFilter: KIXObjectPropertyFilter;
    private textFilterValue: string;
    private additionalFilterCriteria: TableFilterCriteria[] = [];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
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
        this.setTableConfiguration();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, true, null
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
        }
    }

    private setTableConfiguration(): void {
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

            table.setTableListener(() => {
                this.state.title = this.getTitle();
            });

            WidgetService.getInstance().setActionData(this.state.instanceId, table);

            this.state.table = table;
        }
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

    private getTitle(): string {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${this.state.table.getTableRows(true).length})`;
        }
        return title;
    }

    private async contextObjectListChanged(objectList: KIXObject[]): Promise<void> {
        if (this.state.table) {
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(objectList);
            await this.state.table.loadRows();

            const context = ContextService.getInstance().getActiveContext();
            context.setFilteredObjectList(context.getObjectList());
        }
    }

}

module.exports = Component;
