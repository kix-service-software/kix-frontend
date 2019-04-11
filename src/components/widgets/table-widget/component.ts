import { ComponentState } from './ComponentState';
import {
    TableFilterCriteria, KIXObjectType, ContextType, KIXObjectPropertyFilter, TableWidgetSettings
} from '../../../core/model';
import { IEventSubscriber, EventService } from '../../../core/browser/event';
import {
    ContextService, IdService, TableEvent, WidgetService, ActionFactory, TableFactoryService,
    TableEventData, ComponentsService
} from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { ComponentInput } from './ComponentInput';
class Component {

    public state: ComponentState;

    private additionalFilterCriteria: TableFilterCriteria[] = [];

    private objectType: KIXObjectType;

    private subscriber: IEventSubscriber;

    private contextType: ContextType;

    private configuredTitle: boolean = true;

    private useContext: boolean = true;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
        this.contextType = input.contextType;
        this.configuredTitle = typeof input.title === 'undefined';
        if (!this.configuredTitle) {
            this.state.title = input.title;
        }

        this.useContext = typeof input.useContext !== 'undefined' ? input.useContext : true;
        if (!this.useContext) {
            this.state.widgetConfiguration = input.widgetConfiguration;
        }
    }

    public async onMount(): Promise<void> {
        this.state.filterPlaceHolder = await TranslationService.translate(this.state.filterPlaceHolder);
        this.additionalFilterCriteria = [];
        const context = ContextService.getInstance().getActiveContext(this.contextType);

        if (this.useContext) {
            this.state.widgetConfiguration = context
                ? context.getWidgetConfiguration(this.state.instanceId)
                : undefined;
        }

        if (this.state.widgetConfiguration) {
            const settings: TableWidgetSettings = this.state.widgetConfiguration.settings;
            this.state.showFilter = typeof settings.showFilter !== 'undefined' ? settings.showFilter : true;

            this.state.icon = this.state.widgetConfiguration.icon;

            this.state.predefinedTableFilter = this.state.widgetConfiguration ?
                this.state.widgetConfiguration.predefinedTableFilters : [];

            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.state.instanceId),
                eventPublished: async (data: TableEventData, eventId: string) => {
                    if (data && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_READY) {
                            await this.prepareTitle();
                            this.state.filterCount = this.state.table.isFiltered()
                                ? this.state.table.getRowCount()
                                : null;
                        }
                        WidgetService.getInstance().updateActions(this.state.instanceId);
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);

            await this.prepareHeader();
            await this.prepareTable();
            await this.prepareTitle();
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

    private async prepareHeader(): Promise<void> {
        const settings: TableWidgetSettings = this.state.widgetConfiguration.settings;
        if (settings && settings.headerComponents) {
            this.state.headerTitleComponents = settings.headerComponents;
        }
    }

    private async prepareTitle(): Promise<void> {
        if (this.configuredTitle) {
            let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";

            title = await TranslationService.translate(title);

            let count = 0;
            if (this.state.table) {
                count = this.state.table.getRowCount(true);
            }
            this.state.title = `${title} (${count})`;
        }
    }


    private async prepareTable(): Promise<void> {
        const settings: TableWidgetSettings = this.state.widgetConfiguration.settings;
        if (
            settings && settings.objectType || (settings.tableConfiguration && settings.tableConfiguration.objectType)
        ) {
            this.objectType = settings.objectType || settings.tableConfiguration.objectType;
            const context = await ContextService.getInstance().getActiveContext(this.contextType);
            const contextId = this.state.widgetConfiguration.contextDependent
                ? context.getDescriptor().contextId
                : null;

            const table = await TableFactoryService.getInstance().createTable(
                `table-widget-${this.state.instanceId}`, this.objectType,
                settings.tableConfiguration, null, contextId, true, true
            );

            if (settings.sort) {
                await table.sort(settings.sort[0], settings.sort[1]);
            }

            this.state.table = table;
        }
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, this.state.table
            );

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
        }
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table && !this.state.isFiltering) {
            this.state.isFiltering = true;
            const predefinedCriteria = filter ? filter.criteria : [];
            const newFilter = [...predefinedCriteria, ...this.additionalFilterCriteria];
            this.state.table.setFilter(textFilterValue, newFilter);
            await this.state.table.filter();
            this.state.isFiltering = false;
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

    public getTemplate(componentId: string): any {
        return ComponentsService.getInstance().getComponentTemplate(componentId);
    }

}

module.exports = Component;
