/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { UIFilterCriterion } from '../../../../../model/UIFilterCriterion';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { ComponentInput } from './ComponentInput';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { IdService } from '../../../../../model/IdService';
import { TableEventData, TableEvent, TableFactoryService, Table } from '../../core/table';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXObjectPropertyFilter } from '../../../../../model/KIXObjectPropertyFilter';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextUIEvent } from '../../core/ContextUIEvent';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { IContextListener } from '../../core/IContextListener';
import { FormEvent } from '../../core/FormEvent';
import { FormValuesChangedEventData } from '../../core/FormValuesChangedEventData';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from '../../../../dynamic-fields/webapp/core';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { ClientStorageService } from '../../core/ClientStorageService';

class Component {

    public state: ComponentState;

    private additionalFilterCriteria: UIFilterCriterion[] = [];
    private objectType: KIXObjectType | string;
    private subscriber: IEventSubscriber;
    private configuredTitle: boolean = true;
    private useContext: boolean = true;
    private contextListener: IContextListener;
    private formSubscriber: IEventSubscriber;
    private prepareTitleTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
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
        const context = ContextService.getInstance().getActiveContext();

        if (this.useContext) {
            this.state.widgetConfiguration = context
                ? await context.getWidgetConfiguration(this.state.instanceId)
                : undefined;
        }

        if (this.state.widgetConfiguration) {
            const settings = this.state.widgetConfiguration.configuration as TableWidgetConfiguration;

            this.state.showFilter = typeof settings.showFilter !== 'undefined' ? settings.showFilter : true;

            this.state.icon = this.state.widgetConfiguration.icon;

            this.state.predefinedTableFilter = settings.predefinedTableFilters ? settings.predefinedTableFilters : [];

            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.state.instanceId),
                eventPublished: async (data: any, eventId: string): Promise<void> => {
                    if (eventId === ContextUIEvent.RELOAD_OBJECTS && data === this.state.table?.getObjectType()
                    ) {
                        this.state.loading = true;
                    }

                    if (eventId === ApplicationEvent.OBJECT_CREATED || eventId === ApplicationEvent.OBJECT_UPDATED) {
                        this.state.table?.reload(true);
                    }

                    if (data?.tableId === this.state.table?.getTableId()) {
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
                                if (this.state.table.isFiltered()) {
                                    this.state.filterCount = this.state.table.getRowCount();
                                    this.state.filterValue = this.state.table.getFilterValue();
                                }
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

            this.prepareContextDependency(settings);
            this.prepareFormDependency();
        }
    }

    private prepareContextDependency(settings: TableWidgetConfiguration): void {
        if (
            this.state.widgetConfiguration.contextDependent ||
            this.state.widgetConfiguration.contextObjectDependent
        ) {
            this.contextListener = {
                sidebarLeftToggled: (): void => { return; },
                filteredObjectListChanged: (): void => { return; },
                objectChanged: (): void => { return; },
                objectListChanged: (objectType: KIXObjectType | string): void => {
                    if (objectType === this.objectType) {
                        if (settings && settings.resetFilterOnReload) {
                            if (this.state.table) {
                                this.state.table.resetFilter();
                            }
                            const filterComponent = (this as any).getComponent('table-widget-filter');
                            if (filterComponent) {
                                filterComponent.reset();
                            }
                        } else if (this.state.table) {
                            this.state.filterValue = this.state.table.getFilterValue();
                        }

                        this.prepareTitle();
                    }
                },
                sidebarRightToggled: (): void => { return; },
                scrollInformationChanged: (objectType: KIXObjectType | string, objectId: string | number): void => {
                    this.scrollToRow(objectType, objectId);
                },
                additionalInformationChanged: (): void => { return; }
            };

            const context = ContextService.getInstance().getActiveContext();
            context.registerListener('table-widget-' + this.state.instanceId, this.contextListener);
        }
    }

    private prepareFormDependency(): void {
        if (this.state.widgetConfiguration.formDependent) {
            this.formSubscriber = {
                eventSubscriberId: IdService.generateDateBasedId('table-widget-' + this.state.instanceId),
                eventPublished: (data: FormValuesChangedEventData, eventId: string): void => {
                    const properties: string[] = [];
                    for (const cv of data.changedValues) {
                        if (cv[0]?.property) {
                            let property = cv[0].property;
                            if (property === KIXObjectProperty.DYNAMIC_FIELDS) {
                                const dfNameOption = cv[0].options.find(
                                    (o) => o.option === DynamicFormFieldOption.FIELD_NAME
                                );
                                if (dfNameOption) {
                                    property = 'DynamicFields.' + dfNameOption.value;
                                }
                            }
                            properties.push(property);
                        }
                    }

                    const relevantHandlerConfigIds = this.getRelevantHandlerConfigIds(properties);
                    if (
                        this.state.table &&
                        (
                            relevantHandlerConfigIds.length
                            || this.state.widgetConfiguration.formDependencyProperties.some(
                                (fdp) => properties.some((p) => p === fdp)
                            )
                        )
                    ) {
                        this.state.table.reload(null, null, relevantHandlerConfigIds);
                    }
                }
            };
            EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }
    }

    private getRelevantHandlerConfigIds(properties: string[]): string[] {
        const relevantHandlerIds = [];
        const settings = this.state.widgetConfiguration.configuration as TableWidgetConfiguration;
        const tableConfiguration = settings?.configuration as TableConfiguration;
        if (Array.isArray(tableConfiguration?.additionalTableObjectsHandler)) {
            tableConfiguration.additionalTableObjectsHandler.forEach((handlerConfig) => {
                if (
                    !handlerConfig.dependencyProperties
                    || !handlerConfig.dependencyProperties.length
                    || handlerConfig.dependencyProperties.some((dp) => properties.some((p) => p === dp))
                ) {
                    relevantHandlerIds.push(handlerConfig.id);
                }
            });
        }
        return relevantHandlerIds;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);

        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.RELOADED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.RELOAD, this.subscriber);
        EventService.getInstance().unsubscribe(ContextUIEvent.RELOAD_OBJECTS, this.subscriber);

        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.unregisterListener('table-widget-' + this.state.instanceId);
        }

        if (this.formSubscriber) {
            EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }

    }

    private async prepareHeader(): Promise<void> {
        const settings = this.state.widgetConfiguration.configuration as TableWidgetConfiguration;
        if (settings && settings.headerComponents) {
            this.state.headerTitleComponents = settings.headerComponents;
        }
    }

    private prepareTitle(): void {

        if (this.prepareTitleTimeout) {
            window.clearTimeout(this.prepareTitleTimeout);
        }

        this.prepareTitleTimeout = setTimeout(async () => {
            let count = 0;
            if (this.state.table) {
                count = this.state.table.getRowCount(true);
            }

            if (!this.configuredTitle) {
                let title = WidgetService.getInstance().getWidgetTitle(this.state.instanceId);
                if (!title) {
                    title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
                }
                title = await TranslationService.translate(title);
                const countString = count > 0 ? ' (' + count + ')' : '';
                this.state.title = title + countString;
            }
        }, 200);
    }

    private async prepareTable(): Promise<void> {
        const settings = this.state.widgetConfiguration.configuration as TableWidgetConfiguration;
        const tableConfiguration = settings?.configuration as TableConfiguration;
        if (settings?.objectType || tableConfiguration?.objectType) {
            this.objectType = tableConfiguration?.objectType || settings.objectType;
            const context = ContextService.getInstance().getActiveContext();
            const contextId = this.state.widgetConfiguration.contextDependent
                ? context.contextId
                : null;

            const table = await TableFactoryService.getInstance().createTable(
                `table-widget-${this.state.instanceId}`, this.objectType,
                tableConfiguration, null, contextId, true,
                tableConfiguration ? tableConfiguration.toggle : true,
                settings.shortTable, false, !settings.cache
            );

            if (settings.sort) {
                table?.sort(settings.sort[0], settings.sort[1]);
            }
            await table?.initialize();

            if (table?.getFilterCriteria()) {
                this.state.predefinedFilterName = ClientStorageService.getOption(`${table?.getTableId()}-predefinedfilter`);
            } else {
                ClientStorageService.deleteState(`${table?.getTableId()}-predefinedfilter`);
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

            if (filter) {
                this.state.predefinedFilterName = filter.name;
                ClientStorageService.setOption(`${this.state.table.getTableId()}-predefinedfilter`, filter.name);
            } else {
                this.state.predefinedFilterName = null;
                ClientStorageService.deleteState(`${this.state.table.getTableId()}-predefinedfilter`);
            }
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

    public getTable(): Table {
        return this.state.table;
    }

}

module.exports = Component;
