import { ComponentState } from './ComponentState';
import {
    KIXObjectPropertyFilter, KIXObjectType, KIXObject, TableFilterCriteria, TicketProperty
} from '@kix/core/dist/model/';
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TicketTableContentLayer, TicketTableLabelLayer
} from '@kix/core/dist/browser/ticket/';
import {
    ITableConfigurationListener, TableSortLayer, TableColumn, TableFilterLayer,
    ActionFactory, TableToggleLayer, StandardTableFactoryService, TableLayerConfiguration,
    TableListenerConfiguration, WidgetService, SearchOperator
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
                objectChanged: this.contextObjectChanged.bind(this)
            });
        }

        this.prepareActions();
        this.setTableConfiguration();
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

            const layerConfiguration = new TableLayerConfiguration(
                new TicketTableContentLayer(
                    null, tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
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

    private filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            this.predefinedFilter = filter;
            this.textFilterValue = textFilterValue;

            const name = filter ? filter.name : null;
            const predefinedCriteria = filter ? filter.criteria : [];
            const newFilter = new KIXObjectPropertyFilter(
                name, [...predefinedCriteria, ...this.additionalFilterCriteria]
            );

            this.state.table.setFilterSettings(textFilterValue, newFilter);
        }
    }

    private getTitle(): string {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${this.state.table.getTableRows(true).length})`;
        }
        return title;
    }

    private contextObjectChanged(objectId: string | number, object: KIXObject, type: KIXObjectType): void {
        if (type === KIXObjectType.QUEUE) {
            const criteria = new TableFilterCriteria(TicketProperty.QUEUE_ID, SearchOperator.EQUALS, objectId);
            this.setTicketFilter(object ? criteria : null);
        }
    }

    private setTicketFilter(criteria: TableFilterCriteria): void {
        this.additionalFilterCriteria = [];

        if (criteria) {
            this.additionalFilterCriteria = [criteria];
        }

        if (!this.predefinedFilter) {
            this.predefinedFilter = new KIXObjectPropertyFilter('Ticketfilter', []);
        }

        this.filter(this.textFilterValue, this.predefinedFilter);
    }
}

module.exports = Component;
