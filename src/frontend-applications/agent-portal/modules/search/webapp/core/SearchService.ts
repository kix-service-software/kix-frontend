/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchDefinition } from './SearchDefinition';
import { SearchResultCategory } from './SearchResultCategory';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { SearchProperty } from '../../model/SearchProperty';
import { SearchSocketClient } from './SearchSocketClient';
import { Bookmark } from '../../../../model/Bookmark';
import { SortUtil } from '../../../../model/SortUtil';
import { BookmarkService } from '../../../../modules/base-components/webapp/core/BookmarkService';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfiguredWidget } from '../../../../model/configuration/ConfiguredWidget';
import { IdService } from '../../../../model/IdService';
import { TableWidgetConfiguration } from '../../../../model/configuration/TableWidgetConfiguration';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { WidgetConfiguration } from '../../../../model/configuration/WidgetConfiguration';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { TableConfiguration } from '../../../../model/configuration/TableConfiguration';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { SearchCache } from '../../model/SearchCache';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { SearchContext } from './SearchContext';
import { ContextMode } from '../../../../model/ContextMode';
import { Table } from '../../../table/model/Table';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { OverlayService } from '../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../base-components/webapp/core/OverlayType';
import { StringContent } from '../../../base-components/webapp/core/StringContent';

export class SearchService {

    private static INSTANCE: SearchService;

    public static getInstance(): SearchService {
        if (!SearchService.INSTANCE) {
            SearchService.INSTANCE = new SearchService();
        }

        return SearchService.INSTANCE;
    }

    private constructor() { }

    private formSearches: Map<KIXObjectType | string, (formId: string) => Promise<any[]>> = new Map();
    private formTableConfigs: Map<KIXObjectType | string, Table> = new Map();
    private searchDefinitions: SearchDefinition[] = [];
    private searchCategory: SearchResultCategory = null;

    public registerFormSearch<T extends KIXObject>(
        objectType: KIXObjectType | string,
        search: (formId: string) => Promise<T[]>,
        tableConfig?: Table): void {
        this.formSearches.set(objectType, search);
        if (tableConfig) {
            this.formTableConfigs.set(objectType, tableConfig);
        }
    }

    public getFormResultTable(objectType: KIXObjectType | string): Table {
        let tableConfig: Table;
        if (this.formTableConfigs.has(objectType)) {
            tableConfig = this.formTableConfigs.get(objectType);
        }
        return tableConfig;
    }

    public async executeSearch<T extends KIXObject = KIXObject>(
        formInstance: FormInstance, excludeObjects: KIXObject[] = []
    ): Promise<T[]> {
        const formObjectType = formInstance.getObjectType();
        const searchDefinition = this.getSearchDefinition(formObjectType);
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

        const loadingOptions = searchDefinition.getLoadingOptions(criteria, null);
        const objects = await KIXObjectService.loadObjects(formObjectType, null, loadingOptions, null, false);
        return (objects as any);
    }

    public async searchObjectsFromSearchId(id: string): Promise<KIXObject[]> {
        const search = await SearchSocketClient.getInstance().loadSearch();
        const searchCache = search?.find((s) => s.id === id);
        return this.searchObjects(searchCache);
    }

    public async searchObjects(
        searchCache: SearchCache,
        context: SearchContext = ContextService.getInstance().getActiveContext<SearchContext>()
    ): Promise<KIXObject[]> {
        if (!searchCache) {
            throw new Error('No search available');
        }

        const searchDefinition = this.getSearchDefinition(searchCache.objectType);

        let preparedCriteria = await searchDefinition.prepareFormFilterCriteria([...searchCache.criteria]);
        preparedCriteria = this.prepareCriteria(preparedCriteria);

        const loadingOptions = searchDefinition.getLoadingOptions(preparedCriteria, searchCache.limit);
        const objects = await KIXObjectService.loadObjects(
            searchCache.objectType, null, loadingOptions, null, false
        );

        if (context instanceof SearchContext) {
            context.setSearchCache(searchCache);
            context.setSearchResult(objects);
        }

        return objects;
    }

    public async executePrimarySearch<T extends KIXObject>(
        objectType: KIXObjectType | string, searchValue: string
    ): Promise<T[]> {
        const searchCache = new SearchCache<T>(null, null, objectType, [], []);
        searchCache.criteria = [
            new FilterCriteria(
                SearchProperty.PRIMARY, SearchOperator.LIKE, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];

        searchCache.primaryValue = searchValue;

        const searchContext = await this.setSearchContext(searchCache?.objectType);
        const objects = await this.searchObjects(searchCache);

        if (Array.isArray(objects) && objects.length === 1) {
            const contextService = ContextService.getInstance();
            const contextDescriptors = contextService.getContextDescriptors(ContextMode.DETAILS);
            const detailContextId = contextDescriptors.find(
                (cd) => cd.kixObjectTypes.some((ot) =>
                    ot === searchContext?.descriptor.kixObjectTypes[0])
            );
            if (detailContextId) {
                contextService.toggleActiveContext();
                contextService.setActiveContext(detailContextId.contextId, objects[0].ObjectId);
            }
        } else {
            await ContextService.getInstance().removeContext(searchContext.instanceId);
            await SearchService.getInstance().executeFullTextSearch(
                objectType, searchValue
            ).catch((error) => {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new StringContent(error), 'Translatable#Search error!',
                    null, true
                );
            });

            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
            );
        }

        return (objects as any);
    }

    public async executeFullTextSearch<T extends KIXObject>(
        objectType: KIXObjectType | string, searchValue: string
    ): Promise<T[]> {
        const searchCache = new SearchCache<T>(null, null, objectType, [], []);
        searchCache.criteria = [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];

        searchCache.fulltextValue = searchValue;

        await this.setSearchContext(searchCache?.objectType);
        const objects = await this.searchObjects(searchCache);
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

    public async getSearchBookmarks(publish?: boolean): Promise<Bookmark[]> {
        const search = await SearchSocketClient.getInstance().loadSearch();
        search.sort((s1, s2) => SortUtil.compareString(s1.name, s2.name));
        const bookmarks = search.map((s) => new Bookmark(
            s.name, this.getSearchIcon(s.objectType), 'load-search-action', { id: s.id, name: s.name })
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

    public async executeSearchCache(
        id?: string, name?: string, cache?: SearchCache, context?: SearchContext, setSearchContext?: boolean
    ): Promise<KIXObject[]> {
        const search = await SearchSocketClient.getInstance().loadSearch();
        let searchCache = cache || search.find((s) => s.id === id);
        if (!searchCache && name) {
            searchCache = search.find((s) => s.name === name);
        }

        if (setSearchContext) {
            context = await this.setSearchContext(searchCache?.objectType);
        }

        return await this.searchObjects(searchCache, context);
    }

    private async setSearchContext(objectType: KIXObjectType | string): Promise<SearchContext> {
        let context: SearchContext;
        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        if (Array.isArray(descriptors)) {
            const descriptor = descriptors.find((d) => d.kixObjectTypes[0] === objectType);
            context = await ContextService.getInstance().setActiveContext(descriptor?.contextId) as SearchContext;
        }

        return context;
    }

    public async loadSearchCache(id: string): Promise<SearchCache> {
        const search = await SearchSocketClient.getInstance().loadSearch();
        let searchCache = search.find((s) => s.id === id);
        if (searchCache) {
            searchCache = SearchCache.create(searchCache);
        }

        return searchCache;
    }

    public async createTableWidget(id: string, name: string): Promise<ConfiguredWidget> {
        const search = await SearchSocketClient.getInstance().loadSearch();
        const searchCache = search.find((s) => s.id === id);

        let widget: ConfiguredWidget;
        if (searchCache) {
            const icon = LabelService.getInstance().getObjectIconForType(searchCache.objectType,);

            const tableWidgetConfiguration = new TableWidgetConfiguration(
                IdService.generateDateBasedId(), name, ConfigurationType.TableWidget, searchCache.objectType,
            );

            const tableConfiguration = new TableConfiguration(IdService.generateDateBasedId(), name);
            tableConfiguration.searchId = searchCache.id;
            tableConfiguration.objectType = searchCache.objectType;

            const tableFactory = TableFactoryService.getInstance().getTableFactory(searchCache.objectType);
            const columns = await tableFactory.getDefaultColumnConfigurations(searchCache);

            tableConfiguration.tableColumns = columns;
            tableWidgetConfiguration.configuration = tableConfiguration;

            const widgetConfiguration = new WidgetConfiguration(
                IdService.generateDateBasedId(), name, ConfigurationType.Widget, 'table-widget', name, [], null,
                tableWidgetConfiguration, false, true, icon
            );
            widgetConfiguration.title = searchCache.name;

            widget = new ConfiguredWidget(IdService.generateDateBasedId(name), null, widgetConfiguration);

        }
        return widget;
    }

}
