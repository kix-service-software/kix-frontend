import { ComponentState } from './ComponentState';
import { TableFilterCriteria, KIXObjectType, ContextType, KIXObjectPropertyFilter } from '../../../core/model';
import { IEventSubscriber, EventService } from '../../../core/browser/event';
import {
    ContextService, IdService, TableEvent, WidgetService, ActionFactory, TableFactoryService, TableEventData
} from '../../../core/browser';
class Component {

    public state: ComponentState;

    private additionalFilterCriteria: TableFilterCriteria[] = [];

    private objectType: KIXObjectType;

    private subscriber: IEventSubscriber;

    private contextType: ContextType;

    private configuredTitle: boolean = true;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.contextType = input.contextType;
        this.configuredTitle = input.title === undefined;
        this.state.title = input.title;
    }

    public async onMount(): Promise<void> {
        this.additionalFilterCriteria = [];
        const context = ContextService.getInstance().getActiveContext(this.contextType);
        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration) {
            this.state.icon = this.state.widgetConfiguration.icon;
            this.prepareTitle();
            this.state.predefinedTableFilter = this.state.widgetConfiguration ?
                this.state.widgetConfiguration.predefinedTableFilters : [];

            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.state.instanceId),
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (eventId === TableEvent.TABLE_READY && data && data.tableId === this.state.table.getTableId()) {
                        this.prepareTitle();
                        this.state.filterCount = this.state.table.isFiltered()
                            ? this.state.table.getRowCount()
                            : null;
                    }
                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);

            await this.prepareTable();
            this.prepareActions();

            if (this.state.widgetConfiguration.contextDependent) {
                context.registerListener('table-widget-' + this.state.table.getTableId(), {
                    explorerBarToggled: () => { return; },
                    filteredObjectListChanged: () => { return; },
                    objectChanged: () => { return; },
                    objectListChanged: () => {
                        this.state.table.resetFilter();
                        const filterComponent = (this as any).getComponent('table-widget-filter');
                        if (filterComponent) {
                            filterComponent.reset();
                        }
                    },
                    sidebarToggled: () => { return; },
                    scrollInformationChanged: (objectType: KIXObjectType, objectId: string | number) => {
                        this.scrollToRow(objectType, objectId);
                    }
                });
            }
        }
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
    }

    private prepareTitle(): void {
        if (this.configuredTitle) {
            let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
            if (this.state.table) {
                title = `${title} (${this.state.table.getRowCount(true)})`;
            }
            this.state.title = title;
        }
    }


    private async prepareTable(): Promise<void> {
        const settings = this.state.widgetConfiguration.settings;
        if (
            settings && settings.objectType || (settings.tableConfiguration && settings.tableConfiguration.objectType)
        ) {
            this.objectType = settings.objectType || settings.tableConfiguration.objectType;
            const context = await ContextService.getInstance().getActiveContext(this.contextType);
            const contextId = this.state.widgetConfiguration.contextDependent
                ? context.getDescriptor().contextId
                : null;

            const table = TableFactoryService.getInstance().createTable(
                this.objectType, settings.tableConfiguration, null, contextId, true, true
            );

            if (settings.sort) {
                await table.sort(settings.sort[0], settings.sort[1]);
            }

            this.state.table = table;
        }
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, this.state.table
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
        }
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            const predefinedCriteria = filter ? filter.criteria : [];
            const newFilter = [...predefinedCriteria, ...this.additionalFilterCriteria];
            this.state.table.setFilter(textFilterValue, newFilter);
            await this.state.table.filter();
        }
    }

    private scrollToRow(objectType: KIXObjectType, objectId: string | number): void {
        if (this.state.table.getObjectType() === objectType) {
            const row = this.state.table.getRowByObjectId(objectId);
            if (row) {
                EventService.getInstance().publish(
                    TableEvent.SCROLL_TO_AND_TOGGLE_ROW,
                    new TableEventData(this.state.table.getTableId(), row.getRowId())
                );
            }
        }
    }

}

module.exports = Component;
