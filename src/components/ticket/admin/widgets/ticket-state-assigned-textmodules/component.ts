import {
    AbstractMarkoComponent, ContextService, ActionFactory, TableFactoryService, WidgetService, TableEvent
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TicketStateDetailsContext } from '../../../../../core/browser/ticket';
import { TicketState, KIXObjectType, KIXObjectPropertyFilter } from '../../../../../core/model';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> {

    public tableSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketStateDetailsContext>(
            TicketStateDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.prepareActions();
        this.prepareTable();
        this.prepareTitle();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private prepareTitle(): void {
        if (this.state.widgetConfiguration) {
            const count = this.state.table ? this.state.table.getRows(true).length : 0;
            this.state.title = `${this.state.widgetConfiguration.title} (${count})`;
        }
    }

    private prepareTable(): void {
        const table = TableFactoryService.getInstance().createTable(
            KIXObjectType.TEXT_MODULE, null, null, null, true
        );

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.tableSubscriber = {
            eventSubscriberId: 'ticket-admin-priorities-table-listener',
            eventPublished: (data: any, eventId: string) => {
                if (data === table.getTableId()) {
                    if (eventId === TableEvent.TABLE_READY || eventId === TableEvent.TABLE_INITIALIZED) {
                        this.state.filterCount = this.state.table.isFiltered()
                            ? this.state.table.getRows().length : null;
                        this.prepareTitle();
                    }

                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            }
        };

        this.state.table = table;
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            this.state.table.setFilter(textFilterValue, filter ? filter.criteria : []);
            this.state.table.filter();
        }
    }

}

module.exports = Component;
