/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObjectPropertyFilter, KIXObject, KIXObjectType, SearchCache, } from '../../../../core/model/';
import { ContextService } from "../../../../core/browser/context";
import {
    ActionFactory, IKIXObjectSearchListener, LabelService, WidgetService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, SearchResultCategory,
    KIXObjectService, SearchProperty, TableFactoryService, TableEvent, TableEventData, ITable
} from '../../../../core/browser';
import { SearchContext } from '../../../../core/browser/search/context/SearchContext';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';

class Component implements IKIXObjectSearchListener {

    public listenerId: string;
    public eventSubscriberId: string;

    private tableSubscriber: IEventSubscriber;

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.listenerId = this.state.instanceId;
        this.eventSubscriberId = this.state.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        SearchService.getInstance().registerListener(this);
        this.searchFinished();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        const cache = SearchService.getInstance().getSearchCache();
        if (cache) {
            const category = SearchService.getInstance().getActiveSearchResultExplorerCategory();
            TableFactoryService.getInstance().destroyTable(
                `search-result-list-${category ? category.objectType : cache.objectType}`
            );
        }
    }

    public searchCleared(): void {
        this.searchResultCategoryChanged(null);
    }

    public searchFinished<T extends KIXObject = KIXObject>(): void {
        const cache = SearchService.getInstance().getSearchCache();
        if (cache) {
            this.state.noSearch = false;
            const category = SearchService.getInstance().getActiveSearchResultExplorerCategory();
            this.initWidget(category ? category.objectType : cache.objectType, cache);
        } else {
            this.state.noSearch = true;
        }
    }

    private async initWidget(
        objectType: KIXObjectType, cache: SearchCache<KIXObject> = SearchService.getInstance().getSearchCache()
    ): Promise<void> {
        this.state.table = null;
        if (objectType) {
            this.state.loading = true;

            const isSearchMainObject = cache.objectType === objectType;

            let objectIds = [];
            const activeCategory = SearchService.getInstance().getActiveSearchResultExplorerCategory();
            if (activeCategory) {
                objectIds = activeCategory.objectIds ? activeCategory.objectIds : [];
            }
            const resultCount: number = objectIds.length;

            const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
            this.state.resultIcon = labelProvider.getObjectIcon();
            const objectName = await labelProvider.getObjectName(true);

            const titleLabel = await TranslationService.translate('Translatable#Hit List', []);
            this.state.resultTitle = `${titleLabel} ${objectName} (${resultCount})`;

            let emptyResultHint;
            if (!cache) {
                emptyResultHint = 'Translatable#No search query found.';
            }

            const searchDefinition = SearchService.getInstance().getSearchDefinition(
                objectType
            );

            const tableConfiguration = new TableConfiguration(null, null, null,
                objectType, searchDefinition.getLoadingOptionsForResultList(),
                null, null, [], true, null, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL, emptyResultHint
            );
            const table = await TableFactoryService.getInstance().createTable(
                `search-result-list-${objectType}`, objectType, tableConfiguration,
                objectIds, undefined, true, true, false, true
            );

            this.tableSubscriber = {
                eventSubscriberId: 'search-result-table-listener',
                eventPublished: async (data: TableEventData, eventId: string) => {
                    if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED && isSearchMainObject) {
                            const parameter: Array<[string, any]> = [];
                            for (const c of cache.criteria) {
                                if (c.property !== SearchProperty.FULLTEXT) {
                                    parameter.push([c.property, c.value]);
                                }
                            }
                            const columns = await searchDefinition.getTableColumnConfiguration(parameter);
                            table.addColumns(columns);
                        }
                        if (eventId === TableEvent.TABLE_READY) {
                            this.state.filterCount = this.state.table.isFiltered()
                                ? this.state.table.getRowCount()
                                : null;
                        }
                        await this.prepareActions(table);
                    }
                }
            };

            await this.prepareActions(table);

            setTimeout(() => {
                this.state.table = table;
                EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
                EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
                EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
                this.setActionsDirty();
            }, 50);
        } else {
            this.state.resultIcon = null;
            const titleLabel = await TranslationService.translate('Translatable#Hit List', []);
            this.state.resultTitle = titleLabel;
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private async prepareActions(table: ITable): Promise<void> {
        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        if (this.state.widgetConfiguration) {
            this.state.actions = await ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.actions, table);
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            this.state.table.setFilter(textFilterValue, filter ? filter.criteria : null);
            this.state.table.filter();
        }
    }

    public async searchResultCategoryChanged(category: SearchResultCategory): Promise<void> {
        await this.initWidget(category ? category.objectType : null);
    }

}

module.exports = Component;
