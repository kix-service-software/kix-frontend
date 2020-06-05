/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchCache } from '../../model/SearchCache';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ITable } from '../../../base-components/webapp/core/table';
import { SearchDefinition } from './SearchDefinition';
import { SearchResultCategory } from './SearchResultCategory';
import { IKIXObjectSearchListener } from './IKIXObjectSearchListener';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { SearchContext } from './SearchContext';
import { FormService } from '../../../../modules/base-components/webapp/core/FormService';
import { SearchFormInstance } from '../../../../modules/base-components/webapp/core/SearchFormInstance';
import { CacheState } from '../../model/CacheState';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { SearchProperty } from '../../model/SearchProperty';
import { SearchSocketClient } from './SearchSocketClient';
import { BrowserUtil } from '../../../../modules/base-components/webapp/core/BrowserUtil';
import { Bookmark } from '../../../../model/Bookmark';
import { SortUtil } from '../../../../model/SortUtil';
import { BookmarkService } from '../../../../modules/base-components/webapp/core/BookmarkService';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';

export class SearchService {

    private static INSTANCE: SearchService;

    public static getInstance(): SearchService {
        if (!SearchService.INSTANCE) {
            SearchService.INSTANCE = new SearchService();
        }

        return SearchService.INSTANCE;
    }

    private constructor() { }

    private searchCache: SearchCache<KIXObject>;
    private formSearches: Map<KIXObjectType | string, (formId: string) => Promise<any[]>> = new Map();
    private formTableConfigs: Map<KIXObjectType | string, ITable> = new Map();
    private searchDefinitions: SearchDefinition[] = [];
    private activeSearchResultExplorerCategory: SearchResultCategory = null;

    private listeners: IKIXObjectSearchListener[] = [];

    public registerListener(listener: IKIXObjectSearchListener): void {
        const existingListenerIndex = this.listeners.findIndex((l) => l.listenerId === listener.listenerId);
        if (existingListenerIndex !== -1) {
            this.listeners.splice(existingListenerIndex, 1, listener);
        } else {
            this.listeners.push(listener);
        }
    }

    public registerFormSearch<T extends KIXObject>(
        objectType: KIXObjectType | string,
        search: (formId: string) => Promise<T[]>,
        tableConfig?: ITable): void {
        this.formSearches.set(objectType, search);
        if (tableConfig) {
            this.formTableConfigs.set(objectType, tableConfig);
        }
    }

    public getFormResultTable(objectType: KIXObjectType | string): ITable {
        let tableConfig: ITable;
        if (this.formTableConfigs.has(objectType)) {
            tableConfig = this.formTableConfigs.get(objectType);
        }
        return tableConfig;
    }

    public async provideResult(objectType: KIXObjectType | string, objects: KIXObject[] = null): Promise<void> {
        const context = await ContextService.getInstance().getContext<SearchContext>(SearchContext.CONTEXT_ID);
        if (context && this.searchCache) {
            if (objects) {
                context.setObjectList(objectType, objects);
            } else {
                context.setObjectList(this.searchCache.objectType, this.searchCache.result);
            }
        }
    }

    public async executeSearch<T extends KIXObject = KIXObject>(
        formId: string, excludeObjects?: KIXObject[]
    ): Promise<T[]> {
        let objects;
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        if (formInstance) {
            const objectType = formInstance.getObjectType();
            const searchDefinition = this.getSearchDefinition(objectType);

            if (formInstance instanceof SearchFormInstance) {
                const criteria = formInstance.getCriteria().filter(
                    (c) => typeof c.value !== 'undefined' && c.value !== null && c.value !== ''
                );

                const cacheName = this.searchCache && this.searchCache.status === CacheState.VALID
                    ? this.searchCache.name
                    : null;
                this.searchCache = new SearchCache<T>(objectType, criteria, [], null, CacheState.VALID, cacheName);
                objects = await this.doSearch();
                this.provideResult(objectType);
            } else {
                const formFieldValues = formInstance.getAllFormFieldValues();
                let criteria = [];

                const iterator = formFieldValues.keys();
                let key = iterator.next();
                while (key.value) {
                    const formFieldInstanceId = key.value;
                    const value = formFieldValues.get(formFieldInstanceId);

                    if (value.value && value.value !== '') {
                        const formField = await formInstance.getFormField(formFieldInstanceId);
                        if (formField) {
                            const preparedCriteria = await searchDefinition.prepareSearchFormValue(
                                formField.property, value.value
                            );
                            criteria = [...criteria, ...preparedCriteria];
                        }
                    }

                    key = iterator.next();
                }

                if (excludeObjects && !!excludeObjects.length) {
                    criteria.push(new FilterCriteria(
                        excludeObjects[0].getIdPropertyName(),
                        SearchOperator.NOT_EQUALS,
                        FilterDataType.STRING,
                        FilterType.AND,
                        excludeObjects[0].ObjectId.toString()
                    ));
                }

                criteria = criteria.filter((c) => {
                    if (Array.isArray(c.value)) {
                        return c.value.length > 0;
                    } else {
                        return c.value !== null && c.value !== undefined && c.value !== '';
                    }
                });

                const loadingOptions = searchDefinition.getLoadingOptions(criteria);
                objects = await KIXObjectService.loadObjects(objectType, null, loadingOptions, null, false);
            }
        } else {
            throw new Error('No form found: ' + formId);
        }

        return (objects as any);
    }

    private async doSearch(): Promise<KIXObject[]> {
        const searchDefinition = this.getSearchDefinition(this.searchCache.objectType);

        let preparedCriteria = await searchDefinition.prepareFormFilterCriteria(this.searchCache.criteria);
        preparedCriteria = this.prepareCriteria(preparedCriteria);

        const loadingOptions = searchDefinition.getLoadingOptions(preparedCriteria);
        const objects = await KIXObjectService.loadObjects(
            this.searchCache.objectType, null, loadingOptions, null, false
        );
        this.searchCache.result = objects;

        const category = await this.getSearchResultCategories();
        if (category) {
            const ids: any = objects.map((o) => o.ObjectId);
            category.objectIds = ids;
            this.setActiveSearchResultExplorerCategory(category);
        }

        this.listeners.forEach((l) => l.searchFinished());
        return objects;
    }

    public async executeFullTextSearch<T extends KIXObject>(
        objectType: KIXObjectType | string, searchValue: string
    ): Promise<T[]> {
        this.searchCache = new SearchCache<T>(
            objectType,
            [
                new FilterCriteria(
                    SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
                )
            ], []
        );

        this.searchCache.fulltextValue = searchValue;

        const objects = await this.doSearch();
        return (objects as any);
    }

    public registerSearchDefinition(searchDefinition: SearchDefinition): void {
        this.searchDefinitions.push(searchDefinition);
    }

    public async getSearchProperties(
        objectType: KIXObjectType | string, parameter?: Array<[string, any]>
    ): Promise<Array<[string, string]>> {
        const searchDefinition = this.getSearchDefinition(objectType);
        let properties = [];
        if (searchDefinition) {
            properties = await searchDefinition.getProperties(parameter);
        }
        return properties;
    }

    public getSearchCache(): SearchCache<KIXObject> {
        return this.searchCache;
    }

    public clearSearchCache(): void {
        this.searchCache = null;
        this.listeners.forEach((l) => l.searchCleared());
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const searchDefinition = this.searchCache && this.searchCache.objectType ?
            this.searchDefinitions.find((sd) => sd.objectType === this.searchCache.objectType) : null;
        let categories;
        if (searchDefinition) {
            categories = await searchDefinition.getSearchResultCategories();
        }
        return categories;
    }

    public setActiveSearchResultExplorerCategory(category: SearchResultCategory): void {
        this.activeSearchResultExplorerCategory = category;
        this.listeners.forEach((l) => l.searchResultCategoryChanged(this.activeSearchResultExplorerCategory));
    }

    public getActiveSearchResultExplorerCategory(): SearchResultCategory {
        return this.activeSearchResultExplorerCategory;
    }

    public getSearchDefinition(objectType: KIXObjectType | string): SearchDefinition {
        return this.searchDefinitions.find((sd) => sd.objectType === objectType);
    }

    private prepareCriteria(criteria: FilterCriteria[]): FilterCriteria[] {
        const prepareCriteria: FilterCriteria[] = [];

        criteria.forEach((c) => {
            switch (c.operator) {
                case SearchOperator.BETWEEN:
                    if (c.value) {
                        prepareCriteria.push(new FilterCriteria(
                            c.property, SearchOperator.GREATER_THAN_OR_EQUAL, c.type, c.filterType, c.value[0]
                        ));
                        prepareCriteria.push(new FilterCriteria(
                            c.property, SearchOperator.LESS_THAN_OR_EQUAL, c.type, c.filterType, c.value[1]
                        ));
                    }
                    break;
                default:
                    prepareCriteria.push(c);
            }
        });
        return prepareCriteria;
    }

    public async saveCache(name: string, existingName: string): Promise<void> {
        if (this.searchCache) {
            const search = new SearchCache(
                this.searchCache.objectType, [...this.searchCache.criteria], [],
                this.searchCache.fulltextValue, CacheState.VALID, name
            );

            await SearchSocketClient.getInstance().saveSearch(search, existingName)
                .then(async () => {
                    this.searchCache.name = name;
                    await this.getSearchBookmarks(true);
                    this.listeners.forEach((l) => l.searchFinished());
                }).catch((error: Error) => BrowserUtil.openErrorOverlay(error.message));
        }
    }

    public async getSearchBookmarks(publish?: boolean): Promise<Bookmark[]> {
        const search = await SearchSocketClient.getInstance().loadSearch();
        search.sort((s1, s2) => SortUtil.compareString(s1.name, s2.name));
        const bookmarks = search.map((s) => new Bookmark(
            s.name, this.getSearchIcon(s.objectType), 'load-search-action', s.name)
        );

        if (publish) {
            BookmarkService.getInstance().publishBookmarks('search', bookmarks);
        }
        return bookmarks;
    }

    private getSearchIcon(objectType: KIXObjectType | string): string {
        switch (objectType) {
            case KIXObjectType.TICKET:
                return 'kix-icon-searchtemplate-ticket';
            case KIXObjectType.CONFIG_ITEM:
                return 'kix-icon-searchtemplate-ci';
            case KIXObjectType.CONTACT:
                return 'kix-icon-searchtemplate-contact';
            case KIXObjectType.ORGANISATION:
                return 'kix-icon-searchtemplate-organisation';
            case KIXObjectType.FAQ_ARTICLE:
                return 'kix-icon-searchtemplate-faq';
            default:
                return 'kix-icon-unknown';
        }
    }

    public async deleteSearch(): Promise<void> {
        if (this.searchCache && this.searchCache.name !== null) {
            await SearchSocketClient.getInstance().deleteSearch(this.searchCache.name);
            this.getSearchBookmarks(true);
            this.clearSearchCache();
        }
    }

    public async loadSearch(name: string): Promise<void> {
        const search = await SearchSocketClient.getInstance().loadSearch();
        const searchCache = search.find((s) => s.name === name);
        if (searchCache) {
            this.searchCache = new SearchCache(
                searchCache.objectType, searchCache.criteria, [], searchCache.fulltextValue, CacheState.VALID, name
            );

            await this.doSearch();
        }
    }

}
