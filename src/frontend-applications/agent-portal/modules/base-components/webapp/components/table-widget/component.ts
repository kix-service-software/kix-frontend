/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { TableFilterCriteria } from "../../../../../model/TableFilterCriteria";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { IEventSubscriber } from "../../../../../modules/base-components/webapp/core/IEventSubscriber";
import { ContextType } from "../../../../../model/ContextType";
import { ComponentInput } from "./ComponentInput";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { TableWidgetConfiguration } from "../../../../../model/configuration/TableWidgetConfiguration";
import { IdService } from "../../../../../model/IdService";
import { TableEventData, TableEvent, TableFactoryService } from "../../core/table";
import { WidgetService } from "../../../../../modules/base-components/webapp/core/WidgetService";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ActionFactory } from "../../../../../modules/base-components/webapp/core/ActionFactory";
import { KIXObjectPropertyFilter } from "../../../../../model/KIXObjectPropertyFilter";
import { KIXModulesService } from "../../../../../modules/base-components/webapp/core/KIXModulesService";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { ContextUIEvent } from "../../core/ContextUIEvent";
import { ApplicationEvent } from "../../core/ApplicationEvent";

class Component {

    public state: ComponentState;

    private additionalFilterCriteria: TableFilterCriteria[] = [];

    private objectType: KIXObjectType | string;

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
        this.configuredTitle = typeof input.title !== 'undefined';
        if (this.configuredTitle) {
            this.state.title = input.title;
        }

        this.useContext = typeof input.useContext !== 'undefined' ? input.useContext : true;
        if (!this.useContext) {
            this.state.widgetConfiguration = input.widgetConfiguration;
        }
    }

    public async onMount(): Promise<void> {
        this.state.filterPlaceholder = await TranslationService.translate(this.state.filterPlaceholder);
        this.additionalFilterCriteria = [];
        const context = ContextService.getInstance().getActiveContext(this.contextType);

        if (this.useContext) {
            this.state.widgetConfiguration = context
                ? context.getWidgetConfiguration(this.state.instanceId)
                : undefined;
        }

        if (this.state.widgetConfiguration) {
            const settings: TableWidgetConfiguration = this.state.widgetConfiguration.configuration;

            context.addObjectDependency(settings.objectType);

            this.state.showFilter = typeof settings.showFilter !== 'undefined' ? settings.showFilter : true;

            this.state.icon = this.state.widgetConfiguration.icon;

            this.state.predefinedTableFilter = settings.predefinedTableFilters ? settings.predefinedTableFilters : [];

            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.state.instanceId),
                eventPublished: async (data: any, eventId: string) => {
                    if (
                        this.state.table &&
                        eventId === ContextUIEvent.RELOAD_OBJECTS &&
                        data === this.state.table.getObjectType()
                    ) {
                        this.state.loading = true;
                    }

                    if (eventId === ApplicationEvent.OBJECT_CREATED || eventId === ApplicationEvent.OBJECT_UPDATED) {
                        if (this.state.table && data.objectType === this.state.table.getObjectType()) {
                            this.state.table.reload(true);
                        }
                    }

                    if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.RELOAD) {
                            this.state.loading = true;
                        } else if (eventId === TableEvent.RELOADED) {
                            if (settings && settings.resetFilterOnReload) {
                                const filterComponent = (this as any).getComponent('table-widget-filter');
                                if (filterComponent) {
                                    filterComponent.reset();
                                }
                            } else {
                                this.state.table.filter();
                            }


                            setTimeout(() => this.state.loading = false, 100);
                        } else {
                            if (eventId === TableEvent.TABLE_READY) {
                                this.state.filterCount = this.state.table.isFiltered()
                                    ? this.state.table.getRowCount()
                                    : null;
                                this.prepareTitle();
                                this.prepareActions();
                            }
                            WidgetService.getInstance().updateActions(this.state.instanceId);
                        }
                    }
                }
            };

            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.RELOADED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.RELOAD, this.subscriber);
            EventService.getInstance().subscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);

            this.prepareHeader();
            this.prepareTable().then(() => this.prepareTitle());

            if (this.state.widgetConfiguration.contextDependent) {
                context.registerListener('table-widget-' + this.state.instanceId, {
                    explorerBarToggled: () => { return; },
                    filteredObjectListChanged: () => { return; },
                    objectChanged: () => { return; },
                    objectListChanged: (objectType: KIXObjectType | string) => {
                        if (objectType === this.objectType) {
                            if (settings && settings.resetFilterOnReload) {
                                if (this.state.table) {
                                    this.state.table.resetFilter();
                                }
                                const filterComponent = (this as any).getComponent('table-widget-filter');
                                if (filterComponent) {
                                    filterComponent.reset();
                                }
                            }
                        }
                    },
                    sidebarToggled: () => { return; },
                    scrollInformationChanged: (objectType: KIXObjectType | string, objectId: string | number) => {
                        this.scrollToRow(objectType, objectId);
                    },
                    additionalInformationChanged: () => { return; }
                });
            }
        }
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.RELOADED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.RELOAD, this.subscriber);
        EventService.getInstance().unsubscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);
        TableFactoryService.getInstance().destroyTable(`table-widget-${this.state.instanceId}`);
    }

    private async prepareHeader(): Promise<void> {
        const settings: TableWidgetConfiguration = this.state.widgetConfiguration.configuration;
        if (settings && settings.headerComponents) {
            this.state.headerTitleComponents = settings.headerComponents;
        }
    }

    private async prepareTitle(): Promise<void> {
        let count = 0;
        if (this.state.table) {
            count = this.state.table.getRowCount(true);
        }

        if (!this.configuredTitle) {
            let title = WidgetService.getInstance().getWidgetTitle(this.state.instanceId);
            if (!title) {
                title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
            }
            title = await TranslationService.translate(title);
            const countString = count > 0 ? " (" + count + ")" : "";
            this.state.title = title + countString;
        }
    }


    private async prepareTable(): Promise<void> {
        const settings: TableWidgetConfiguration = this.state.widgetConfiguration.configuration;
        if (
            settings && settings.objectType || (settings.tableConfiguration && settings.tableConfiguration.objectType)
        ) {
            this.objectType = settings.objectType || settings.tableConfiguration.objectType;
            const context = ContextService.getInstance().getActiveContext(this.contextType);
            const contextId = this.state.widgetConfiguration.contextDependent
                ? context.getDescriptor().contextId
                : null;

            const table = await TableFactoryService.getInstance().createTable(
                `table-widget-${this.state.instanceId}`, this.objectType,
                settings.tableConfiguration, null, contextId, true, true, settings.shortTable, false, !settings.cache
            );

            if (table) {
                if (settings.sort) {
                    table.sort(settings.sort[0], settings.sort[1]);
                }
                await table.initialize();
            }

            this.state.table = table;
            this.state.loading = false;
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

    private scrollToRow(objectType: KIXObjectType | string, objectId: string | number): void {
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
        return KIXModulesService.getComponentTemplate(componentId);
    }

}

module.exports = Component;
