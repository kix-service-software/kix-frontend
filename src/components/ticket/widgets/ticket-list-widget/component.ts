import { TicketListComponentState } from './model/TicketListComponentState';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import {
    TicketDetails, ContextFilter, Context, ObjectType, Ticket, TicketState, TicketProperty
} from '@kix/core/dist/model/';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import {
    TicketNotification,
    TicketService,
    TicketTableContentProvider,
    TicketTableLabelProvider,
    TicketTableSelectionListener,
    TicketTableClickListener,
    TicketUtil
} from '@kix/core/dist/browser/ticket/';
import {
    StandardTableColumn, StandardTable, StandardTableRowHeight,
    ITableConfigurationListener,
    StandardTableSortLayer
} from '@kix/core/dist/browser';

class TicketListWidgetComponent {

    public state: TicketListComponentState;

    protected store: any;

    private componentInitialized: boolean = false;

    public onCreate(input: any): void {
        this.state = new TicketListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.setTableConfiguration();
    }

    private contextServiceNotified(requestId: string, type: ContextNotification, ...args) {
        if (type === ContextNotification.CONTEXT_FILTER_CHANGED) {
            const contextFilter: ContextFilter = args[0];
            if (contextFilter && contextFilter.objectType === ObjectType.QUEUE && contextFilter.objectValue) {
                this.state.StatuscontextFilter = contextFilter;
                this.filter();
            } else {
                this.state.contextFilter = null;
            }
        } else if (type === ContextNotification.CONTEXT_UPDATED) {
            const context = ContextService.getInstance().getContext();
            this.state.widgetConfiguration =
                context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
            this.setTableConfiguration();
        }
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {

            const configurationListener: ITableConfigurationListener<Ticket> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.tableConfiguration = new StandardTable(
                new TicketTableContentProvider(this.state.instanceId, 100),
                new TicketTableLabelProvider(),
                [],
                [new StandardTableSortLayer()],
                this.state.widgetConfiguration.settings.tableColumns || [],
                new TicketTableSelectionListener(),
                new TicketTableClickListener(),
                true,
                true,
                StandardTableRowHeight.SMALL,
                100,
                10
            );

            this.filter();
        }
    }

    private columnConfigurationChanged(column: StandardTableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.columnId);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index] = column;
        } else {
            this.state.widgetConfiguration.settings.tableColumns.push(column);
        }

        DashboardService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.widgetConfiguration);
    }

    private filterChanged(event): void {
        this.state.filterValue = event.target.value;
    }

    private filter(): void {
        // let usedContextFilter = false;
        // if (
        //     this.state.widgetConfiguration && this.state.widgetConfiguration.contextDependent &&
        //     this.state.contextFilter
        // ) {
        //     this.state.tableConfiguration.contentProvider.filterObjectsByProperty(
        //         this.state.contextFilter.objectProperty, this.state.contextFilter.objectValue
        //     );
        //     usedContextFilter = true;
        // }

        // if (this.state.filterValue !== null && this.state.filterValue !== "") {
        //     this.state.tableConfiguration.contentProvider.filterObjects(this.state.filterValue);
        // } else if (!usedContextFilter) {
        //     this.state.tableConfiguration.contentProvider.resetFilter();
        // }
    }

}

module.exports = TicketListWidgetComponent;
