/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { IdService } from '../../../../model/IdService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { SortOrder } from '../../../../model/SortOrder';
import { ContextEvents } from '../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectSocketClient } from '../../../base-components/webapp/core/KIXObjectSocketClient';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchService } from '../../../search/webapp/core';
import { ITableContentProvider } from '../../model/ITableContentProvider';
import { RowObject } from '../../model/RowObject';
import { Table } from '../../model/Table';
import { TableValue } from '../../model/TableValue';
import { TableFactoryService } from './factory/TableFactoryService';

export class TableContentProvider<T = any> implements ITableContentProvider<T> {

    protected initialized: boolean = false;

    protected context: Context;
    protected subscriber: IEventSubscriber;

    protected useCache: boolean = true;

    public usePaging: boolean = true;

    protected useBackendSort: boolean = false;

    protected currentPageIndex: number = 1;

    protected reloadInProgress: boolean = false;

    private id: string = IdService.generateDateBasedId('TableContentProvider');

    public totalCount: number;
    public currentLimit: number;

    private sort: [string, boolean];

    public constructor(
        protected objectType: KIXObjectType | string,
        protected table: Table,
        protected objectIds: Array<number | string>,
        protected loadingOptions: KIXObjectLoadingOptions,
        protected contextId?: string,
        protected objects?: KIXObject[],
        protected specificLoadingOptions?: KIXObjectSpecificLoadingOptions
    ) { }

    public async initialize(): Promise<void> {
        if (!this.initialized) {

            if (this.contextId) {

                this.context = ContextService.getInstance().getActiveContext();

                this.context?.registerListener(this.table.getTableId() + '-content-provider', {
                    sidebarLeftToggled: (): void => { return; },
                    filteredObjectListChanged: (): void => { return; },
                    objectChanged: this.objectChanged.bind(this),
                    objectListChanged: this.objectListChanged.bind(this),
                    sidebarRightToggled: (): void => { return; },
                    scrollInformationChanged: () => { return; },
                    additionalInformationChanged: (): void => { return; }
                });

                this.subscriber = {
                    eventSubscriberId: IdService.generateDateBasedId(),
                    eventPublished: (context: Context): void => {
                        if (this.context.instanceId === context.instanceId) {
                            this.currentPageIndex = 1;
                        }
                    }
                };

                EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
            }
            this.initialized = true;
        }
    }

    public async destroy(): Promise<void> {
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                context.unregisterListener(this.table.getTableId() + '-content-provider');
            }

            if (this.subscriber) {
                EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
            }
        }
    }

    private objectChanged(id: number | string, object: KIXObject, objectType: KIXObjectType | string): void {
        if (objectType === this.getContextObjectType()) {
            this.table.reload(true);
        }

    }

    private objectListChanged(objectType: KIXObjectType | string, filteredObjectList: KIXObject[]): void {
        if (objectType === this.getContextObjectType()) {
            // set sort in table if needed
            if (this.isBackendSortSupported()) {
                const context = ContextService.getInstance().getActiveContext();
                if (context && context.contextId === this.contextId) {
                    const sort = context.getSort(this.objectType);
                    if (sort?.length) {
                        this.table.setSort(sort[0], sort[1] ? SortOrder.DOWN : SortOrder.UP);
                    }
                }
            }
            this.table.reload(true);
        }
    }

    protected getContextObjectType(): KIXObjectType | string {
        return this.objectType;
    }

    public getObjectType(): KIXObjectType | string {
        return this.objectType;
    }

    public async loadMore(): Promise<void> {
        this.currentPageIndex++;
        if (this.contextId && !this.objectIds) {
            const pageSize = await this.context?.getPageSize(this.objectType) || this.loadingOptions?.limit || 20;
            const currentLimit = this.currentPageIndex * pageSize;

            const context = ContextService.getInstance().getActiveContext();
            await context.reloadObjectList(this.objectType, undefined, currentLimit);
        }
        await this.table.reload();
    }

    public async loadData(): Promise<Array<RowObject<T>>> {
        let objects = [];

        const pageSize = this.loadingOptions?.limit || (this.isBackendSortSupported() ? 20 : null);
        this.currentLimit = this.usePaging && pageSize
            ? this.currentPageIndex * pageSize
            : null;

        if (this.objects) {
            objects = this.objects;
        } else if (this.table.getTableConfiguration().searchId) {
            const hasDFColumn = this.hasDFColumnConfigured();
            const includes = hasDFColumn ? [KIXObjectProperty.DYNAMIC_FIELDS] : [];
            objects = await SearchService.getInstance().executeSearchCache(
                this.table.getTableConfiguration().searchId, undefined, undefined, undefined, undefined,
                includes, this.currentLimit, this.loadingOptions?.searchLimit, this.sort
            );
            this.totalCount = KIXObjectSocketClient.getInstance().getCollectionsCount(
                this.table.getTableConfiguration().searchId
            );
            this.currentLimit = KIXObjectSocketClient.getInstance().getCollectionsLimit(
                this.table.getTableConfiguration().searchId
            );
        } else if (this.contextId && !this.objectIds) {
            const context = ContextService.getInstance().getActiveContext();
            if (context && context.contextId === this.contextId) {
                objects = await context.getObjectList(this.objectType, this.currentLimit);
                const collectionId = context.getCollectionId() || context.contextId + this.objectType;
                this.totalCount = KIXObjectSocketClient.getInstance().getCollectionsCount(
                    collectionId
                );
                this.currentLimit = KIXObjectSocketClient.getInstance().getCollectionsLimit(
                    collectionId
                );
            }
        } else if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
            const forceIds = (this.objectIds && this.objectIds.length > 0) ? true : false;
            const loadingOptions = await this.prepareLoadingOptions();

            if (this.usePaging) {
                loadingOptions.limit = this.currentLimit;
            }

            objects = await KIXObjectService.loadObjects<KIXObject>(
                this.objectType, !this.useBackendSort ? this.objectIds : null,
                loadingOptions, this.specificLoadingOptions,
                forceIds, this.useCache, undefined, this.id
            );

            if (this.currentLimit) {
                this.totalCount = KIXObjectSocketClient.getInstance().getCollectionsCount(this.id);
            }
        }

        if (!objects) {
            objects = [];
        }

        return await this.getRowObjects(objects);
    }

    public async getRowObjects(objects: T[]): Promise<RowObject<T>[]> {
        const rowObjectPromises: Array<Promise<RowObject<T>>> = [];
        const rowObjects: Array<RowObject<T>> = [];
        if (objects) {
            for (const o of objects) {

                if (this.reloadInProgress) {
                    const row = this.table.getRowByObjectId((o as any).ObjectId);
                    if (row) {
                        rowObjects.push(row.getRowObject());
                        continue;
                    }
                }

                rowObjectPromises.push(new Promise<RowObject<T>>(async (resolve, reject) => {
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {

                        let tableValue: TableValue;
                        const dfName = KIXObjectService.getDynamicFieldName(column.property);
                        if (dfName) {
                            const dfv: DynamicFieldValue = o[KIXObjectProperty.DYNAMIC_FIELDS].find(
                                (dfv) => dfv.Name === dfName
                            );
                            tableValue = new TableValue(column.property, dfv?.Value, dfv?.DisplayValue?.toString());
                            tableValue.displayValueList = dfv?.PreparedValue;

                            // split display value on reference fields,
                            // because they often use some short value (ValueLookup) as prepared value
                            // TODO: use correct display string of referenced object type
                            const dynamicField = await KIXObjectService.loadDynamicField(dfName);
                            if (dfv?.DisplayValue && dynamicField && dynamicField.FieldType.match(/Reference$/)) {
                                tableValue.displayValueList = dynamicField.Config?.ItemSeparator ?
                                    dfv.DisplayValue.split(dynamicField.Config.ItemSeparator) :
                                    null;
                            }
                        } else {
                            tableValue = new TableValue(column.property, o[column.property], null, null, null);

                        }
                        values.push(tableValue);
                    }
                    await this.prepareSpecificValues(values, o);
                    const rowObject = new RowObject<T>(values, o);

                    if (this.hasChildRows(rowObject)) {
                        await this.addChildRows(rowObject);
                    }

                    resolve(rowObject);
                }));
            }
        }

        const loadedRowObjects = await Promise.all(rowObjectPromises);
        rowObjects.push(...loadedRowObjects);

        return rowObjects;
    }

    protected async prepareSpecificValues(values: TableValue[], object: T): Promise<void> {
        return;
    }

    protected hasChildRows(rowObject: RowObject): boolean {
        return false;
    }

    protected async addChildRows(rowObject: RowObject): Promise<void> {
        return;
    }

    protected async prepareLoadingOptions(): Promise<KIXObjectLoadingOptions> {
        const sortOrder = this.sort?.length ?
            await KIXObjectService.getSortOrder(this.sort[0], this.sort[1], this.objectType) :
            this.loadingOptions?.sortOrder;
        const loadingOptions = new KIXObjectLoadingOptions(
            [],
            sortOrder,
            this.loadingOptions?.limit,
            this.loadingOptions?.includes,
            this.loadingOptions?.expands,
            this.loadingOptions?.query,
            this.loadingOptions?.cacheType,
            this.loadingOptions?.searchLimit
        );


        if (this.useBackendSort && this.objectIds?.length) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    'ID', SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, this.objectIds as any
                )
            );
        }

        const context = ContextService.getInstance().getActiveContext();
        const contextObject = await context?.getObject();
        if (this.loadingOptions && Array.isArray(this.loadingOptions.filter)) {
            for (const criterion of this.loadingOptions.filter) {
                if (typeof criterion.value === 'string') {
                    const value = await PlaceholderService.getInstance().replacePlaceholders(
                        criterion.value, contextObject
                    );
                    const preparedCriterion = new FilterCriteria(
                        criterion.property, criterion.operator, criterion.type, criterion.filterType, value
                    );
                    loadingOptions.filter.push(preparedCriterion);
                } else if (Array.isArray(criterion.value)) {
                    const values = [];
                    for (const value of criterion.value) {
                        if (typeof value === 'string') {
                            const replacedValue = await PlaceholderService.getInstance().replacePlaceholders(
                                value, contextObject
                            );
                            values.push(replacedValue);
                        } else {
                            values.push(value);
                        }
                    }
                    const preparedCriterion = new FilterCriteria(
                        criterion.property, criterion.operator, criterion.type, criterion.filterType, values
                    );
                    loadingOptions.filter.push(preparedCriterion);
                } else {
                    loadingOptions.filter.push(criterion);
                }
            }
        }

        if (Array.isArray(loadingOptions.query)) {
            const preparedQuery: Array<[string, string]> = [];
            for (const q of loadingOptions.query) {
                const newQuery: [string, string] = [q[0], ''];
                newQuery[1] = await PlaceholderService.getInstance().replacePlaceholders(q[1], contextObject);
                preparedQuery.push(newQuery);
            }
            loadingOptions.query = preparedQuery;
        }

        const hasDFInclude = loadingOptions?.includes?.some((i) => i === KIXObjectProperty.DYNAMIC_FIELDS);

        if (!hasDFInclude && this.hasDFColumnConfigured()) {
            if (Array.isArray(loadingOptions.includes)) {
                loadingOptions.includes.push(KIXObjectProperty.DYNAMIC_FIELDS);
            } else {
                loadingOptions.includes = [KIXObjectProperty.DYNAMIC_FIELDS];
            }
        }

        await TableFactoryService.getInstance().prepareTableLoadingOptions(loadingOptions, this.table);

        return loadingOptions;
    }

    private hasDFColumnConfigured(): boolean {
        const tableColumns = this.table?.getTableConfiguration()?.tableColumns || [];
        const hasDFColumn = tableColumns?.some((tc) => KIXObjectService.getDynamicFieldName(tc.property));
        return hasDFColumn;
    }

    public async setSort(property: string, direction: SortOrder, reload: boolean = true): Promise<void> {
        if (await this.isBackendSortSupportedForProperty(property)) {
            const descanding = Boolean(direction === SortOrder.DOWN);
            if (!this.sort?.length || this.sort[0] !== property || this.sort[1] !== descanding) {
                this.sort = [property, descanding];

                if (this.contextId) {
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.contextId === this.contextId) {
                        context.setSortOrder(
                            this.objectType, property, descanding, reload, this.currentLimit
                        );
                    }
                } else if (reload) {
                    await this.table.reload();
                }
            }
        } else {
            // eslint-disable-next-line no-console
            console.warn(`Sort with property "${property}" is not supported.`);
        }
    }

    public isBackendSortSupported(): boolean {
        let supportsBackendSort = this.useBackendSort;
        if (supportsBackendSort && this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            if (context && context.contextId === this.contextId) {
                supportsBackendSort = context.supportsBackendSort(this.objectType);
            }
        }
        return supportsBackendSort;
    }

    public async isBackendSortSupportedForProperty(property: string): Promise<boolean> {
        if (this.isBackendSortSupported()) {
            return await KIXObjectService.isBackendSortSupportedForProperty(property, this.objectType) || false;
        }
        return false;
    }
}
