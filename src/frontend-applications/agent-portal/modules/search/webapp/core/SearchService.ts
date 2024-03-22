/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchDefinition } from './SearchDefinition';
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
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { UserLabelProvider } from '../../../user/webapp/core/UserLabelProvider';

export class SearchService {

    private static INSTANCE: SearchService;

    public static getInstance(): SearchService {
        if (!SearchService.INSTANCE) {
            SearchService.INSTANCE = new SearchService();
        }

        return SearchService.INSTANCE;
    }

    private constructor() {
    }

    private formSearches: Map<KIXObjectType | string, (formId: string) => Promise<any[]>> = new Map();
    private formTableConfigs: Map<KIXObjectType | string, Table> = new Map();
    private searchDefinitions: SearchDefinition[] = [];

    private readonly TICKET_SEARCH_CONTEXTID = 'search-ticket-context';

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

    public async getLoadingOptions<T extends KIXObject = KIXObject>(
        formInstance: FormInstance, excludeObjects: KIXObject[] = [], limit?: number,
        includeLinks?: boolean
    ): Promise<KIXObjectLoadingOptions> {
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

        const loadingOptions = await searchDefinition.getLoadingOptions(criteria, limit);

        if (includeLinks) {
            if (!loadingOptions.includes) {
                loadingOptions.includes = [];
            }
            if (!loadingOptions.expands) {
                loadingOptions.expands = [];
            }
            loadingOptions.includes.push(KIXObjectProperty.LINKS);
            loadingOptions.expands.push(KIXObjectProperty.LINKS);
        }

        loadingOptions.searchLimit = limit;

        return loadingOptions;
    }

    public async searchObjectsFromSearchId(id: string): Promise<KIXObject[]> {
        const search = await SearchSocketClient.getInstance().loadSearches();
        const searchCache = search?.find((s) => s.id === id);
        return this.searchObjects(searchCache);
    }

    public async searchObjects(
        searchCache: SearchCache,
        context: SearchContext = ContextService.getInstance().getActiveContext<SearchContext>(),
        additionalIncludes: string[] = [], limit?: number, searchLimit?: number, sort?: [string, boolean],
        setResult: boolean = true
    ): Promise<KIXObject[]> {
        if (!searchCache) {
            throw new Error('No search available');
        }

        const searchDefinition = this.getSearchDefinition(searchCache.objectType);

        let preparedCriteria = await searchDefinition.prepareFormFilterCriteria([...searchCache.criteria]);
        preparedCriteria = this.prepareCriteria(preparedCriteria);

        const loadingOptions = await searchDefinition.getLoadingOptions(
            preparedCriteria, null, searchCache.sortAttribute, searchCache.sortDescending
        );

        if (limit) {
            loadingOptions.limit = limit;
        }

        const hastDFInCriteria = preparedCriteria.some((criteria) => criteria.property.startsWith('DynamicFields.'));
        if (hastDFInCriteria) {
            if (Array.isArray(loadingOptions.includes)) {
                loadingOptions.includes.push(KIXObjectProperty.DYNAMIC_FIELDS);
            }
            else {
                loadingOptions.includes = [KIXObjectProperty.DYNAMIC_FIELDS];
            }
        }
        const includes = context.getAdditionalInformation('INCLUDES');
        if (includes && includes.length > 0) {
            additionalIncludes.push(...includes);
        }

        let uniqueIncludes: any;

        if (additionalIncludes && additionalIncludes.length > 0) {
            uniqueIncludes = additionalIncludes.filter((element, index) => {
                return additionalIncludes.indexOf(element) === index;
            });
        }

        if (uniqueIncludes?.length) {
            if (Array.isArray(loadingOptions.includes)) {
                loadingOptions.includes.push(...uniqueIncludes);
            }
            else {
                loadingOptions.includes = uniqueIncludes;
            }
        }

        if (context) {
            await context.prepareContextLoadingOptions(searchCache.objectType, loadingOptions);
        }

        if (!loadingOptions.limit) {
            loadingOptions.limit = searchCache.limit;
        }

        if (sort?.length) {
            loadingOptions.sortOrder = await KIXObjectService.getSortOrder(sort[0], sort[1], searchCache.objectType);
        }

        loadingOptions.searchLimit = searchLimit || searchCache.limit || loadingOptions.searchLimit;

        const objects = await KIXObjectService.loadObjects(
            searchCache.objectType, null, loadingOptions, null, false, undefined, undefined, searchCache.id
        );

        if (setResult && context instanceof SearchContext) {
            setTimeout(() => {
                context.setSearchCache(searchCache);
                context.setSearchResult(objects);
            }, 1000);
        }

        return objects;
    }

    public async executeUserFulltextSearch(value?: string): Promise<void> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Search' }
        );

        const searchDescriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        const searchContextDescriptor = this.getSearchContextDescriptor();
        const hasTicketSearchContext = searchDescriptors.some((sd) => sd.contextId === this.TICKET_SEARCH_CONTEXTID);

        let contextId: string = searchContextDescriptor?.contextId;
        if (!searchContextDescriptor && hasTicketSearchContext) {
            contextId = this.TICKET_SEARCH_CONTEXTID;
        } else if (!searchContextDescriptor && searchDescriptors.length) {
            contextId = searchDescriptors[0].contextId;
        }

        const descriptor = searchContextDescriptor || ContextService.getInstance().getContextDescriptor(contextId);
        if (descriptor && value) {
            await this.executePrimarySearch(descriptor.kixObjectTypes[0], value).catch((error) => {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new StringContent(error), 'Translatable#Search error!',
                    null, true
                );
            });
        }
    }

    private getSearchContextDescriptor(): ContextDescriptor {
        const context = ContextService.getInstance().getActiveContext();
        const searchDescriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        const searchContextDescriptor = searchDescriptors.find(
            (sd) => sd.kixObjectTypes.some((ot) => ot === context.descriptor.kixObjectTypes[0])
        );
        return searchContextDescriptor;
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

        const objects = await this.searchObjects(
            searchCache, undefined, undefined, undefined, undefined, undefined, false
        );

        if (Array.isArray(objects) && objects.length === 1) {
            const contextService = ContextService.getInstance();
            const contextDescriptors = contextService.getContextDescriptors(ContextMode.DETAILS);
            const detailContextId = contextDescriptors.find(
                (cd) => cd.kixObjectTypes.some((ot) =>
                    ot === objectType)
            );
            if (detailContextId) {
                contextService.toggleActiveContext();
                contextService.setActiveContext(detailContextId.contextId, objects[0].ObjectId);
            }
        } else {
            await SearchService.getInstance().executeFullTextSearch(objectType, searchValue, true).catch((error) => {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new StringContent(error), 'Translatable#Search error!',
                    null, true
                );
            });

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
        }

        return (objects as any);
    }

    public async executeFullTextSearch<T extends KIXObject>(
        objectType: KIXObjectType | string, searchValue: string, setContext?: boolean
    ): Promise<T[]> {
        const searchCache = new SearchCache<T>(null, null, objectType, [], []);
        searchCache.criteria = [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];

        searchCache.fulltextValue = searchValue;

        const searchDefinition = this.getSearchDefinition(objectType);
        searchDefinition?.appendFullTextCriteria(searchCache.criteria);

        let context;
        if (setContext) {
            context = await this.setSearchContext(objectType);
        }

        const objects = await this.searchObjects(
            searchCache, context, undefined, undefined, undefined, undefined, setContext
        );
        return (objects as any);
    }

    public registerSearchDefinition(searchDefinition: SearchDefinition): void {
        this.searchDefinitions.push(searchDefinition);
    }

    public getSearchDefinition(objectType: KIXObjectType | string): SearchDefinition {
        return this.searchDefinitions.find((sd) => sd.objectType === objectType);
    }

    private prepareCriteria(criteria: FilterCriteria[]): FilterCriteria[] {
        const prepareCriteria: FilterCriteria[] = [];

        criteria.forEach((c) => {
            switch (c.operator) {
                case SearchOperator.BETWEEN:
                    if (Array.isArray(c.value) && c.value[0] && c.value[1]) {
                        // switch if necessary
                        const switchValue = c.type === FilterDataType.NUMERIC ?
                            Boolean(SortUtil.compareNumber(c.value[0], c.value[1]) > 0) :
                            Boolean(SortUtil.compareDate(c.value[0].toString(), c.value[1].toString()) > 0);
                        if (switchValue) {
                            const oldStartValue = c.value[0];
                            c.value[0] = c.value[1];
                            c.value[1] = oldStartValue;
                        }
                        prepareCriteria.push(new FilterCriteria(
                            c.property, SearchOperator.GREATER_THAN_OR_EQUAL, c.type, c.filterType, c.value[0]
                        ));
                        prepareCriteria.push(new FilterCriteria(
                            c.property, SearchOperator.LESS_THAN_OR_EQUAL, c.type, c.filterType, c.value[1]
                        ));
                    }
                    break;
                case SearchOperator.WITHIN:
                    if (
                        Array.isArray(c.value) &&
                        c.value[0] && c.value[1] && c.value[2] && c.value[3] && c.value[4] && c.value[5] &&
                        !isNaN(Number(c.value[1])) && !isNaN(Number(c.value[4]))
                    ) {
                        // switch if necessary
                        let switchWithin = false;
                        if (c.value[0] !== c.value[3]) {
                            switchWithin = c.value[3] === '-';
                        } else if (
                            (
                                c.value[0] === '+' &&
                                this.getSeconds(Number(c.value[1]), c.value[2].toString()) >
                                this.getSeconds(Number(c.value[4]), c.value[5].toString())
                            ) || (
                                c.value[0] === '-' &&
                                this.getSeconds(Number(c.value[1]), c.value[2].toString()) <
                                this.getSeconds(Number(c.value[4]), c.value[5].toString())
                            )
                        ) {
                            switchWithin = true;
                        }
                        if (switchWithin) {
                            const oldStartType = c.value[0];
                            const oldStartValue = c.value[1];
                            const oldStartUnit = c.value[2];
                            c.value[0] = c.value[3];
                            c.value[1] = c.value[4];
                            c.value[2] = c.value[5];
                            c.value[3] = oldStartType;
                            c.value[4] = oldStartValue;
                            c.value[5] = oldStartUnit;
                        }
                        prepareCriteria.push(new FilterCriteria(
                            c.property, SearchOperator.GREATER_THAN_OR_EQUAL, c.type, c.filterType,
                            `${c.value[0]}${c.value[1]}${c.value[2]}`
                        ));
                        prepareCriteria.push(new FilterCriteria(
                            c.property, SearchOperator.LESS_THAN_OR_EQUAL, c.type, c.filterType,
                            `${c.value[3]}${c.value[4]}${c.value[5]}`
                        ));
                    }
                    break;
                default:
                    prepareCriteria.push(c);
            }
        });
        return prepareCriteria;
    }

    private getSeconds(value: number, unit: string): number {
        switch (unit) {
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 60 * 60 * 24;
            case 'w':
                return value * 60 * 60 * 24 * 7;
            case 'M':
                return value * 60 * 60 * 24 * 30;
            case 'Y':
                return value * 60 * 60 * 24 * 365;
            default:
                return value;
        }
    }

    public async getSearchBookmarks(publish?: boolean, userOnly?: boolean): Promise<Bookmark[]> {
        let searches = await SearchSocketClient.getInstance().loadAllSearches() || [];

        searches.sort((s1, s2) => SortUtil.compareString(s1.name, s2.name));

        if (userOnly) {
            const user = await AgentSocketClient.getInstance().getCurrentUser();
            searches = searches.filter((s) => !s.userId || s.userId === user.UserID);
        }

        const bookmarks = searches.map((s) => {
            let searchDisplayText = s.name;
            if (s.userDisplayText) {
                searchDisplayText = `(${s.userDisplayText}) - ${s.name}`;
            }
            return new Bookmark(
                searchDisplayText, this.getSearchIcon(s.objectType), 'load-search-action', { id: s.id, name: s.name }, [],
                s.userId ? 'Translatable#Shared Search' : 'Translatable#Searches'
            );
        });

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
        id?: string, name?: string, cache?: SearchCache, context?: SearchContext, setSearchContext?: boolean,
        additionalIncludes: string[] = [], limit?: number, searchLimit?: number, sort?: [string, boolean]
    ): Promise<KIXObject[]> {
        const search = await SearchSocketClient.getInstance().loadAllSearches();
        let searchCache = cache || search.find((s) => s.id === id);
        if (!searchCache && name) {
            searchCache = search.find((s) => s.name === name);
        }

        if (setSearchContext) {
            context = await this.setSearchContext(searchCache?.objectType);
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const objects = await this.searchObjects(
                        searchCache, context, additionalIncludes, limit, searchLimit, sort
                    );
                    resolve(objects);
                }, 500);
            });
        }

        return await this.searchObjects(searchCache, context, additionalIncludes, limit, searchLimit, sort);
    }

    private async setSearchContext(
        objectType: KIXObjectType | string, urlParams?: URLSearchParams
    ): Promise<SearchContext> {
        let context: SearchContext;
        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        if (Array.isArray(descriptors)) {
            const descriptor = descriptors.find((d) => d.kixObjectTypes[0] === objectType);
            context = await ContextService.getInstance().setActiveContext(
                descriptor?.contextId, undefined, urlParams
            ) as SearchContext;
        }

        return context;
    }

    public async loadSearchCache(id: string): Promise<SearchCache> {
        const search = await SearchSocketClient.getInstance().loadSearches();
        let searchCache = search.find((s) => s.id === id);
        if (searchCache) {
            searchCache = SearchCache.create(searchCache);
        }

        return searchCache;
    }

    public async createSearchTableWidget(id: string, name: string): Promise<ConfiguredWidget> {
        const search = await SearchSocketClient.getInstance().loadAllSearches();
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

    public async setSearchCacheAsDefault(search: SearchCache): Promise<void> {
        SearchSocketClient.getInstance().saveSearchAsDefault(search);
    }

}
