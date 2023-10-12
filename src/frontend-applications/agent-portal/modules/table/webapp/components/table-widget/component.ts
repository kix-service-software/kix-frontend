/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXObjectPropertyFilter } from '../../../../../model/KIXObjectPropertyFilter';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { IContextListener } from '../../../../base-components/webapp/core/IContextListener';
import { Table } from '../../../model/Table';
import { TableEvent } from '../../../model/TableEvent';
import { TableEventData } from '../../../model/TableEventData';
import { TableFactoryService } from '../../core/factory/TableFactoryService';
import { Context } from '../../../../../model/Context';
import { FormValueProperty } from '../../../../object-forms/model/FormValueProperty';
import { ObjectFormValue } from '../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../../object-forms/model/ObjectFormEvent';
import { KIXObject } from '../../../../../model/kix/KIXObject';

class Component {

    public state: ComponentState;

    private additionalFilterCriteria: UIFilterCriterion[] = [];
    private objectType: KIXObjectType | string;
    private subscriber: IEventSubscriber;
    private configuredTitle: boolean = true;
    private useContext: boolean = true;
    private contextListener: IContextListener;
    private prepareTitleTimeout: any;
    private context: Context;
    private formBindingIds: Map<string, string>;

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
        this.context = ContextService.getInstance().getActiveContext();

        if (this.useContext) {
            this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);
        }

        if (this.state.widgetConfiguration) {
            const settings = this.state.widgetConfiguration.configuration as TableWidgetConfiguration;

            this.state.showFilter = typeof settings.showFilter !== 'undefined' ? settings.showFilter : true;

            this.state.icon = this.state.widgetConfiguration.icon;

            this.state.predefinedTableFilter = settings.predefinedTableFilters ? settings.predefinedTableFilters : [];

            this.subscriber = {
                eventSubscriberId: IdService.generateDateBasedId(this.state.instanceId),
                eventPublished: async (data: any, eventId: string): Promise<void> => {
                    if (data?.tableId === this.state.table?.getTableId()) {
                        const isdependent = this.state.widgetConfiguration.contextDependent;
                        if (eventId === TableEvent.COLUMN_FILTERED && isdependent) {
                            this.setFilteredObjectListToContext();
                        } else if (eventId === TableEvent.RELOADED) {
                            if (settings && settings.resetFilterOnReload) {
                                const filterComponent = (this as any).getComponent('table-widget-filter');
                                if (filterComponent) {
                                    filterComponent.reset();
                                }
                            }

                            this.prepareTitle();
                        } else {
                            if (eventId === TableEvent.TABLE_READY) {
                                if (this.state.table.isFiltered()) {
                                    this.state.filterCount = this.state.table.getRowCount();
                                    this.state.filterValue = this.state.table.getFilterValue();
                                    this.prepareTitle();
                                } else {
                                    this.state.filterCount = null;
                                }
                            }
                            WidgetService.getInstance().updateActions(this.state.instanceId);
                        }
                    } else if (
                        eventId === ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED
                        && this.formBindingIds.size
                    ) {
                        this.addFormBindings();
                    }

                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.RELOADED, this.subscriber);

            await this.prepare();
            this.state.filterValue = this.state.table ? this.state.table.getFilterValue() : null;
            this.prepareContextDependency(settings);
            this.prepareFormDependency();
        }
    }

    private async prepare(): Promise<void> {
        this.prepareHeader();
        await this.prepareTable();
        this.prepareActions();
        this.prepareTitle();
    }

    private prepareContextDependency(settings: TableWidgetConfiguration): void {
        if (
            this.state.widgetConfiguration.contextDependent ||
            this.state.widgetConfiguration.contextObjectDependent
        ) {
            this.contextListener = {
                sidebarLeftToggled: (): void => { return; },
                filteredObjectListChanged: (): void => { return; },
                objectChanged: async (
                    objectId: number, object: KIXObject, objectType: KIXObjectType | string
                ): Promise<void> => {
                    if (objectType === this.objectType) {
                        await this.reloadTable(settings);
                    }
                },
                objectListChanged: async (objectType: KIXObjectType | string): Promise<void> => {
                    if (objectType === this.objectType) {
                        await this.reloadTable(settings);
                    }
                },
                sidebarRightToggled: (): void => { return; },
                scrollInformationChanged: (objectType: KIXObjectType | string, objectId: string | number): void => {
                    this.scrollToRow(objectType, objectId);
                },
                additionalInformationChanged: (): void => { return; }
            };

            EventService.getInstance().subscribe(TableEvent.COLUMN_FILTERED, this.subscriber);

            const context = ContextService.getInstance().getActiveContext();
            context.registerListener('table-widget-' + this.state.instanceId, this.contextListener);
        }
    }

    private async reloadTable(settings: TableWidgetConfiguration): Promise<void> {
        const activeContext = ContextService.getInstance().getActiveContext();
        if (this.context.instanceId === activeContext.instanceId) {
            if (this.state.table.isFiltered()) {
                if (settings?.resetFilterOnReload) {
                    this.state.table?.resetFilter();
                    const filterComponent = (this as any).getComponent('table-widget-filter');
                    filterComponent?.reset();
                } else if (this.state.table) {
                    this.state.filterValue = this.state.table.getFilterValue();
                }
            }

            await this.prepare();
        }
    }

    private async prepareFormDependency(): Promise<void> {
        if (this.state.widgetConfiguration.formDependent) {
            this.formBindingIds = new Map();
            EventService.getInstance().subscribe(ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED, this.subscriber);
            // add bindings if mapper already initialized
            await this.addFormBindings();
        }
    }

    private async addFormBindings(): Promise<void> {
        const formHandler = await this.context.getFormManager().getObjectFormHandler();
        const formDependencyProperties = [...this.state.widgetConfiguration.formDependencyProperties || []];
        const settings = this.state.widgetConfiguration.configuration as TableWidgetConfiguration;
        const tableConfiguration = settings?.configuration as TableConfiguration;
        const relevantHandlerIds = this.addAdditionalDependenciesAndGetRelevantHandlerIds(
            formDependencyProperties, tableConfiguration
        );
        if (formDependencyProperties.length) {
            for (const property of formDependencyProperties) {
                const formValue = formHandler?.objectFormValueMapper?.findFormValue(property);
                if (formValue) {
                    // remove "old" bindings (prevent double entries)
                    if (this.formBindingIds.has(property)) {
                        formValue.removePropertyBinding([this.formBindingIds.get(property)]);
                    }
                    const formBindingId = formValue.addPropertyBinding(
                        FormValueProperty.VALUE,
                        (value: ObjectFormValue) => {
                            this.state.table?.reload(null, null, relevantHandlerIds);
                        }
                    );
                    this.formBindingIds.set(property, formBindingId);
                }
            }
        }
    }

    private addAdditionalDependenciesAndGetRelevantHandlerIds(
        properties: string[], tableConfiguration: TableConfiguration
    ): string[] {
        const handlerIds = [];
        if (
            Array.isArray(tableConfiguration?.additionalTableObjectsHandler)
            && tableConfiguration?.additionalTableObjectsHandler.length
        ) {
            tableConfiguration.additionalTableObjectsHandler.forEach((handlerConfig) => {
                if (handlerConfig.dependencyProperties?.length) {
                    handlerConfig.dependencyProperties.forEach((dp) => {
                        if (!properties.some((p) => p === dp)) {
                            properties.push(dp);
                        }
                    });
                }
                handlerIds.push(handlerConfig.id);
            });
        }
        return handlerIds;
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
        EventService.getInstance().unsubscribe(TableEvent.COLUMN_FILTERED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED, this.subscriber);

        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.unregisterListener('table-widget-' + this.state.instanceId);
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
            let count = this.state.table?.getContentProvider()?.totalCount || 0;

            if (!count) {
                count = this.state.table?.getRowCount(true);
            }

            let countString = `${count}`;
            // TODO: consider frontend filtering?
            // if current loaded (page) < total, show actually loaded (api-filter/permission) of total
            const currentLimit = this.state.table?.getContentProvider()?.currentLimit || count;
            if (currentLimit < count) {
                const visibleRows = this.state.table?.getRowCount();
                countString = `${visibleRows}/${count}`;
            }

            if (!this.configuredTitle) {
                let title = WidgetService.getInstance().getWidgetTitle(this.state.instanceId);
                if (!title) {
                    title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
                }
                title = await TranslationService.translate(title);
                countString = count > 0 ? ' (' + countString + ')' : '';
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

            const tableState = table?.loadTableState();

            if (settings.sort) {
                const sortColumnId = tableState?.sortColumnId ?? settings.sort[0];
                const sortOrder = tableState?.sortOrder ?? settings.sort[1];
                table?.sort(sortColumnId, sortOrder);
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
            this.state.filterValue = textFilterValue;
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

            if (this.state.widgetConfiguration?.contextDependent) {
                this.setFilteredObjectListToContext();
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

    private setFilteredObjectListToContext(): void {
        const filteredObjects = this.state.table?.getRows()?.map((r) => r.getRowObject()?.getObject());
        this.context?.setFilteredObjectList(this.state.table.getObjectType(), filteredObjects);
    }

}

module.exports = Component;
