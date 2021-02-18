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
import { ContextType } from '../../../../../model/ContextType';
import { ComponentInput } from './ComponentInput';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { IdService } from '../../../../../model/IdService';
import { TableEventData, TableEvent, TableFactoryService } from '../../core/table';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXObjectPropertyFilter } from '../../../../../model/KIXObjectPropertyFilter';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextUIEvent } from '../../core/ContextUIEvent';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { IContextListener } from '../../core/IContextListener';
import { Context } from '../../../../../model/Context';
import { AdditionalContextInformation } from '../../core/AdditionalContextInformation';
import { FormEvent } from '../../core/FormEvent';
import { FormValuesChangedEventData } from '../../core/FormValuesChangedEventData';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from '../../../../dynamic-fields/webapp/core';

class Component {

    public state: ComponentState;

    private additionalFilterCriteria: UIFilterCriterion[] = [];

    private objectType: KIXObjectType | string;

    private subscriber: IEventSubscriber;

    private contextType: ContextType;

    private configuredTitle: boolean = true;

    private useContext: boolean = true;

    private contextListener: IContextListener;

    private formSubscriber: IEventSubscriber;

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
                ? await context.getWidgetConfiguration(this.state.instanceId)
                : undefined;
        }

        if (this.state.widgetConfiguration) {
            this.state.show = true;
            const settings: TableWidgetConfiguration = this.state.widgetConfiguration.configuration;

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
                        this.state.table.reload(true);
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
                        } else if (this.state.table) {
                            this.state.filterValue = this.state.table.getFilterValue();
                        }
                    }
                },
                sidebarToggled: () => { return; },
                scrollInformationChanged: (objectType: KIXObjectType | string, objectId: string | number) => {
                    this.scrollToRow(objectType, objectId);
                },
                additionalInformationChanged: () => { return; }
            };

            ContextService.getInstance().registerListener({
                constexServiceListenerId: 'table-widget' + this.state.instanceId,
                contextChanged: (id: string, c: Context, contextType, history: boolean, oldContext: Context) => {
                    if (oldContext) {
                        oldContext.unregisterListener('table-widget-' + this.state.instanceId);
                    }
                    if (context) {
                        c.registerListener('table-widget-' + this.state.instanceId, this.contextListener);
                    }

                    if (this.state.table) {
                        this.state.table.reload();
                    }
                },
                contextRegistered: () => null
            });

            const context = ContextService.getInstance().getActiveContext(this.contextType);
            context.registerListener('table-widget-' + this.state.instanceId, this.contextListener);
        }
    }

    private prepareFormDependency(): void {
        if (this.state.widgetConfiguration.formDependent) {
            const context = ContextService.getInstance().getActiveContext(this.contextType);

            this.formSubscriber = {
                eventSubscriberId: IdService.generateDateBasedId('ReferencedObjectWidget'),
                eventPublished: (data: FormValuesChangedEventData, eventId: string) => {
                    const properties: string[] = [];
                    for (const cv of data.changedValues) {
                        let property = cv[0].property;
                        if (cv[0].property === KIXObjectProperty.DYNAMIC_FIELDS) {
                            const dfNameOption = cv[0].options.find(
                                (o) => o.option === DynamicFormFieldOption.FIELD_NAME
                            );
                            if (dfNameOption) {
                                property = 'DynamicFields.' + dfNameOption.value;
                            }
                        }
                        properties.push(property);
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
        const settings: TableWidgetConfiguration = this.state.widgetConfiguration.configuration;
        if (
            settings && settings.tableConfiguration
            && Array.isArray(settings.tableConfiguration.additionalTableObjectsHandler)
        ) {
            settings.tableConfiguration.additionalTableObjectsHandler.forEach((handlerConfig) => {
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

        ContextService.getInstance().unregisterListener('table-widget' + this.state.instanceId);

        const context = ContextService.getInstance().getActiveContext(this.contextType);
        if (context) {
            context.unregisterListener('table-widget-' + this.state.instanceId);
        }

        if (this.formSubscriber) {
            EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }

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
                title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
            }
            title = await TranslationService.translate(title);
            const countString = count > 0 ? ' (' + count + ')' : '';
            this.state.title = title + countString;
        }
    }

    private async prepareTable(): Promise<void> {
        const settings: TableWidgetConfiguration = this.state.widgetConfiguration.configuration;
        if (
            settings && settings.objectType || (settings.tableConfiguration && settings.tableConfiguration.objectType)
        ) {
            this.objectType = settings.tableConfiguration && settings.tableConfiguration.objectType
                ? settings.tableConfiguration.objectType : settings.objectType; // table prior table widget
            const context = ContextService.getInstance().getActiveContext(this.contextType);
            const contextId = this.state.widgetConfiguration.contextDependent
                ? context.getDescriptor().contextId
                : null;

            const table = await TableFactoryService.getInstance().createTable(
                `table-widget-${this.state.instanceId}`, this.objectType,
                settings.tableConfiguration, null, contextId, true,
                settings.tableConfiguration ? settings.tableConfiguration.toggle : true,
                settings.shortTable, false, !settings.cache
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
