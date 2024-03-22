/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Row } from './Row';
import { Column } from './Column';
import { ITableContentProvider } from './ITableContentProvider';
import { RowObject } from './RowObject';
import { IColumnConfiguration } from '../../../model/configuration/IColumnConfiguration';
import { TableConfiguration } from '../../../model/configuration/TableConfiguration';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { SortOrder } from '../../../model/SortOrder';
import { UIFilterCriterion } from '../../../model/UIFilterCriterion';
import { ClientStorageService } from '../../base-components/webapp/core/ClientStorageService';
import { EventService } from '../../base-components/webapp/core/EventService';
import { IAdditionalTableObjectsHandler } from '../../base-components/webapp/core/IAdditionalTableObjectsHandler';
import { IEventSubscriber } from '../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { DynamicField } from '../../dynamic-fields/model/DynamicField';
import { DynamicFieldProperty } from '../../dynamic-fields/model/DynamicFieldProperty';
import { SearchOperator } from '../../search/model/SearchOperator';
import { SearchProperty } from '../../search/model/SearchProperty';
import { SearchContext, SearchService } from '../../search/webapp/core';
import { TicketProperty } from '../../ticket/model/TicketProperty';
import { AdditionalTableObjectsHandlerConfiguration } from '../webapp/core/AdditionalTableObjectsHandlerConfiguration';
import { TableEvent } from './TableEvent';
import { TableSortUtil } from '../webapp/core/TableSortUtil';
import { SelectionState } from './SelectionState';
import { TableValue } from './TableValue';
import { ValueState } from './ValueState';
import { TableEventData } from './TableEventData';
import { ContextService } from '../../base-components/webapp/core/ContextService';
import { ContextMode } from '../../../model/ContextMode';
import { SearchCache } from '../../search/model/SearchCache';
import { DataType } from '../../../model/DataType';
import { IdService } from '../../../model/IdService';
import { DefaultDepColumnConfiguration } from './DefaultDepColumnConfiguration';

export class Table implements Table {

    private rows: Row[] = [];
    private filteredRows: Row[] = null;
    private columns: Column[] = [];
    private contentProvider: ITableContentProvider;
    private columnConfigurations: IColumnConfiguration[];
    private additionalColumnConfigurations: IColumnConfiguration[] = [];

    private filterValue: string;
    private filterCriteria: UIFilterCriterion[];

    private initialized: boolean = false;

    private sortColumnId: string;
    private sortOrder: SortOrder;

    private reloadPromise: Promise<void>;
    private handlerRowObjects = {};

    private tableState: TableState;

    private subscriber: IEventSubscriber;

    public constructor(
        private tableKey: string,
        private tableConfiguration?: TableConfiguration,
        private contextId?: string
    ) { }

    public destroy(): void {
        this.contentProvider.destroy();
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.SORTED, this.subscriber);
        EventService.getInstance().unsubscribe(TableEvent.COLUMN_RESIZED, this.subscriber);
    }

    private saveTableState(): void {
        const toggledRows = this.rows.filter((r) => r.isExpanded()).map((r) => r.getRowId());
        const selectedRows = this.rows.filter((r) => r.isSelected()).map((r) => r.getRowId());

        const columnsizes: Array<[string, number]> = this.columns.map(
            (c) => [c.getColumnId(), c.getColumnConfiguration().size]
        );

        this.tableState = new TableState(
            this.filterValue, this.filterCriteria, toggledRows, selectedRows, columnsizes,
            this.sortColumnId, this.sortOrder
        );
        const tableStateString = JSON.stringify(this.tableState);

        ClientStorageService.setOption(this.getTableId(), tableStateString);
    }

    public hasSortByTableState(): boolean {
        let sortByState: boolean = false;
        const tableStateString = ClientStorageService.getOption(this.getTableId());
        try {
            const tableState = JSON.parse(tableStateString);
            sortByState = Boolean(tableState?.sortColumnId && tableState?.sortOrder);
            this.sortColumnId = tableState?.sortColumnId || this.sortColumnId;
            this.sortOrder = tableState?.sortOrder || this.sortOrder;
        } catch (error) {
            console.error('Error loading table state: ' + this.getTableId());
            console.error(error);
        }
        return sortByState;
    }

    public loadTableState(): TableState {
        const tableStateString = ClientStorageService.getOption(this.getTableId());
        try {
            this.tableState = JSON.parse(tableStateString);
            this.filterValue = this.tableState?.filterValue || this.filterValue;
            this.filterCriteria = this.tableState?.filterCriteria || this.filterCriteria;
            this.tableState?.toggledRows?.forEach((tr) => this.getRow(tr)?.expand(true));
            this.sortColumnId = this.tableState?.sortColumnId || this.sortColumnId;
            this.sortOrder = this.tableState?.sortOrder || this.sortOrder;

            if (this.tableState?.selectedRows?.length) {
                this.setRowSelection(this.tableState?.selectedRows || []);
            }

            this.tableState?.columnsizes?.forEach((cs) => this.getColumn(cs[0])?.setSize(cs[1]));
            return this.tableState;
        } catch (error) {
            console.error('Error loading table state: ' + this.getTableId());
            console.error(error);
        }
    }

    public deleteTableState(): void {
        ClientStorageService.deleteState(this.getTableId());
        this.columns.forEach((c) => c.destroy());
    }

    public getTableId(): string {
        return this.tableKey;
    }

    public getContextId(): string {
        return this.contextId;
    }

    public getTableConfiguration(): TableConfiguration {
        return this.tableConfiguration;
    }

    public getObjectType(): KIXObjectType | string {
        return this.tableConfiguration
            ? this.tableConfiguration.objectType
            : this.contentProvider.getObjectType();
    }

    public setContentProvider(contentProvider: ITableContentProvider): void {
        this.contentProvider = contentProvider;
    }

    public getContentProvider(): ITableContentProvider {
        return this.contentProvider;
    }

    public setColumnConfiguration(columnConfiguration: IColumnConfiguration[]): void {
        this.columnConfigurations = columnConfiguration;
    }

    public async initialize(forceReload: boolean = true): Promise<void> {
        if (!this.initialized) {
            this.initialized = true;

            // init provider now to prepare sortable attributes if necessary
            if (this.contentProvider) {
                await this.contentProvider.initialize();
            }

            this.columns = [];
            if (this.columnConfigurations) {
                for (const c of this.columnConfigurations) {
                    await this.createColumn(c);
                }
            }

            if (this.additionalColumnConfigurations) {
                for (const c of this.additionalColumnConfigurations) {
                    await this.createColumn(c);
                }
            }

            await this.prepareAdditionalSearchColumns();

            // set sort for backend handling (before loadRowData)
            await this.initSort();

            // set filter for backend handling (before loadRowData)
            const filtered = await this.initFilter();

            await this.loadRowData();

            this.rows.forEach((r) => {
                this.columns.forEach((c) => {
                    r.addCell(new TableValue(c.getColumnId(), null));
                });
            });

            this.loadTableState();

            await this.initDisplayRows();

            // sort in frontend if loaded data is not already sorted
            if (this.sortColumnId && this.sortOrder && !this.isBackendSortSupported()) {
                await this.sort(this.sortColumnId, this.sortOrder, true);
            }

            // filter in frontend if loaded data is not already filtered
            if (filtered && !this.isBackendFilterSupported()) {
                await this.filter(true);
            }

            this.toggleFirstRow();

            EventService.getInstance().publish(
                TableEvent.TABLE_INITIALIZED,
                new TableEventData(this.getTableId())
            );
            EventService.getInstance().publish(
                TableEvent.TABLE_READY, new TableEventData(this.getTableId())
            );

            this.subscriber = {
                eventSubscriberId: this.getTableId(),
                eventPublished: (data: TableEventData, eventId: string): void => {
                    if (data.tableId === this.getTableId()) {
                        this.saveTableState();
                    }
                }
            };
            EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.SORTED, this.subscriber);
            EventService.getInstance().subscribe(TableEvent.COLUMN_RESIZED, this.subscriber);
        } else if (forceReload) {
            await this.reload();
        }
    }

    private async setSortByContext(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context.contextId === this.contextId) {
            const sort = await context.getSortOrder(this.getObjectType());
            if (sort) {
                let property = sort.split('.')[1];
                if (property) {
                    property = property.split(':')[0];
                    this.sortOrder = SortOrder.UP;
                    if (property.match(/^-.+/)) {
                        this.sortOrder = SortOrder.DOWN;
                        property = property.replace(/-(.+)/, '$1');
                    }
                    if (this.columns.some((c) => c.getColumnId() === property)) {
                        this.sortColumnId = property;
                    }
                }
            }
        }
    }

    private async prepareAdditionalSearchColumns(): Promise<void> {
        let searchCache: SearchCache;
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        if (context?.descriptor.contextMode === ContextMode.SEARCH && context?.getSearchCache()) {
            searchCache = context.getSearchCache();
        } else if (this.tableConfiguration?.searchId) {
            searchCache = await SearchService.getInstance().loadSearchCache(this.tableConfiguration.searchId);
        }

        if (searchCache) {
            const searchDefinition = SearchService.getInstance().getSearchDefinition(searchCache.objectType);

            const parameter: Array<[string, any]> = [];
            const criteria = searchCache.criteria.filter((c) => {
                return c.property !== SearchProperty.FULLTEXT
                    && c.property !== SearchProperty.PRIMARY
                    && c.property !== TicketProperty.CLOSE_TIME
                    && c.property !== TicketProperty.LAST_CHANGE_TIME;
            });
            criteria.forEach((c) => parameter.push([c.property, c.value]));

            const columns = await searchDefinition.getTableColumnConfiguration(parameter);
            await this.addAdditionalColumns(columns);
        }
    }

    private async initSort(): Promise<void> {

        // get sort by state or by context or from configured column
        const hasSortByTableState = this.hasSortByTableState();
        if (hasSortByTableState) {
            const column = this.getColumn(this.sortColumnId);
            if (column) {
                column.setSortOrder(this.sortOrder);
            }
        } else if (this.contextId) {
            await this.setSortByContext();
        }

        if (!this.sortColumnId) {
            const sortColumn = this.columns.find((c) => c.getSortOrder());
            if (sortColumn) {
                this.sortColumnId = sortColumn.getColumnConfiguration().property;
                this.sortOrder = sortColumn.getSortOrder();
            }
        }

        if (this.sortColumnId && this.sortOrder && this.isBackendSortSupported() && !this.hasAdditionalHandler()) {
            await this.getContentProvider().setSort(this.sortColumnId, this.sortOrder, false);
        }
    }

    private async initFilter(): Promise<boolean> {
        const filtered = this.filterValue || this.filterCriteria?.length ||
            this.columns.some((c) => c.isFiltered());

        if (filtered && this.isBackendFilterSupported() && !this.hasAdditionalHandler()) {
            const criteria: FilterCriteria[] = await this.prepareBackendFilterCriteria();
            await this.getContentProvider().setFilter(criteria, false);
        }
        return Boolean(filtered);
    }

    private toggleFirstRow(): void {
        if (this.tableConfiguration &&
            this.tableConfiguration.toggle &&
            this.tableConfiguration.toggleOptions &&
            this.tableConfiguration.toggleOptions.toggleFirst &&
            this.rows.length
        ) {
            this.rows[0].expand(true);
        }
    }

    private async loadRowData(relevantHandlerConfigIds?: string[]): Promise<void> {
        const existingRows = this.rows;
        this.rows = [];
        this.filteredRows = null;

        if (this.contentProvider) {
            const rows = [];
            let rowObjects: RowObject[] = await this.contentProvider.loadData();

            if (
                // if intersection is active and no rowobjects found, result list is always empty, so ignore handler
                (!this.tableConfiguration?.intersection || (rowObjects && rowObjects.length))
                && this.hasAdditionalHandler()
            ) {
                rowObjects = await this.considerHandlerData(rowObjects, relevantHandlerConfigIds);
            }

            rowObjects.forEach((d) => rows.push(this.createRow(d, false, existingRows)));
            this.rows = rows;
        }
    }

    private hasAdditionalHandler(): boolean {
        return Boolean(this.tableConfiguration
            && Array.isArray(this.tableConfiguration.additionalTableObjectsHandler)
            && this.tableConfiguration.additionalTableObjectsHandler.length);
    }

    private async considerHandlerData(
        rowObjects: RowObject<any>[], relevantHandlerConfigIds?: string[]
    ): Promise<RowObject[]> {
        for (const handlerConfig of this.tableConfiguration.additionalTableObjectsHandler) {
            if (handlerConfig && handlerConfig.handlerId) {
                if (
                    !Array.isArray(relevantHandlerConfigIds)
                    || relevantHandlerConfigIds.some((rhid) => rhid === handlerConfig.id)
                    || !Array.isArray(this.handlerRowObjects[handlerConfig.id])
                ) {
                    const handler = ServiceRegistry.getAdditionalTableObjectsHandler(handlerConfig.handlerId);
                    if (handler) {
                        await this.prepareHandlerRowObjects(handler, handlerConfig);
                    }
                }

                if (this.handlerRowObjects && Array.isArray(this.handlerRowObjects[handlerConfig.id])) {
                    if (this.tableConfiguration.intersection) {
                        rowObjects = rowObjects.filter((ro) => this.handlerRowObjects[handlerConfig.id].some(
                            (hro) => ro.getObject().ObjectId === hro.getObject().ObjectId
                        ));
                    } else {
                        this.handlerRowObjects[handlerConfig.id].forEach((hro) => {
                            if (!rowObjects.some(
                                (ro) => ro.getObject().ObjectId === hro.getObject().ObjectId)) {
                                rowObjects.push(hro);
                            }
                        });
                    }
                }
            }
        }
        return rowObjects;
    }

    private async prepareHandlerRowObjects(
        handler: IAdditionalTableObjectsHandler,
        handlerConfig: AdditionalTableObjectsHandlerConfiguration
    ): Promise<void> {
        const objects = await handler.determineObjects(handlerConfig, this.tableConfiguration.loadingOptions);
        const handlerRowObjects = objects ? await this.contentProvider.getRowObjects(objects) : [];
        this.handlerRowObjects[handlerConfig.id] = handlerRowObjects;
    }

    public createRow(tableObject?: RowObject, addRow: boolean = true, existingRows: Row[] = []): Row {
        const objectId = tableObject?.getObject()?.ObjectId || IdService.generateDateBasedId();
        const rowId = Row.getRowId(this.getTableId(), objectId);
        let row = existingRows.find((r) => r.getRowId() === rowId);
        if (!row) {
            row = new Row(this, tableObject);
        } else if (tableObject) {
            row.setRowObject(tableObject);
        }

        if (addRow) {
            this.rows.push(row);
        }
        return row;
    }

    private async createColumn(columnConfiguration: IColumnConfiguration): Promise<Column> {
        let column;

        let canCreate: boolean = false;
        const dfName = KIXObjectService.getDynamicFieldName(columnConfiguration.property);
        if (columnConfiguration && dfName) {
            canCreate = await this.checkDF(dfName);
        } else {
            canCreate = true;
        }

        if (canCreate) {
            if (columnConfiguration.sortable && this.isBackendSortSupported()) {
                columnConfiguration.sortable = await this.getContentProvider()?.isBackendSortSupportedForProperty(
                    columnConfiguration.property, (columnConfiguration as DefaultDepColumnConfiguration).dep
                );
            }
            if (columnConfiguration.filterable && this.isBackendFilterSupported()) {
                columnConfiguration.filterable = await this.getContentProvider()?.isBackendFilterSupportedForProperty(
                    columnConfiguration.property, (columnConfiguration as DefaultDepColumnConfiguration).dep
                );
            }
            column = new Column(this, columnConfiguration);
            this.columns.push(column);
            EventService.getInstance().publish(TableEvent.COLUMN_CREATED, { tableId: this.getTableId() });
        }

        return column;
    }

    private async checkDF(dfName: string): Promise<boolean> {
        let can = false;
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, dfName
                    )
                ], null, null, [DynamicFieldProperty.CONFIG]
            ), null, true
        ).catch(() => [] as DynamicField[]);
        if (dynamicFields.length && dynamicFields[0] && dynamicFields[0].ValidID === 1) {
            can = true;
        }
        return can;
    }

    public getRows(all: boolean = false): Row[] {
        if (all) {
            return this.rows;
        }
        return this.filteredRows ? [...this.filteredRows] : [...this.rows];
    }

    public getSelectedRows(all?: boolean): Row[] {
        const rows = this.getRows(all);
        const selectedRows = this.determineSelectedRows(rows);
        return selectedRows;
    }

    private determineSelectedRows(rows: Row[]): Row[] {
        let selectedRows = [];

        rows.forEach((r) => {
            if (r.isSelected()) {
                selectedRows.push(r);
            }

            const children = r.getChildren();
            if (children && children.length) {
                const selectedSubRows = this.determineSelectedRows(children);
                selectedRows = [...selectedRows, ...selectedSubRows];
            }
        });

        return selectedRows;
    }

    public getRow(rowId: string): Row {
        return this.findRow(this.rows, rowId);
    }

    private findRow(rows: Row[], rowId: string): Row {
        let result: Row;

        for (const row of rows) {

            if (row.getRowId() === rowId) {
                result = row;
                break;
            }

            if (row.getChildren()?.length) {
                const childRow = this.findRow(row.getChildren(), rowId);
                if (childRow) {
                    result = childRow;
                    break;
                }
            }
        }

        return result;
    }

    public removeRows(rowIds: string[]): Row[] {
        const removedRows = [];
        this.rows = this.rows.filter((r) => {
            if (rowIds.some((id) => id === r.getRowId())) {
                removedRows.push(r);
                return false;
            } else {
                return true;
            }
        });
        EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
        return removedRows;
    }

    public addRows(addRows: Row[], index: number = this.rows.length): void {
        const newRows = [];
        addRows.forEach((r) => {
            if (
                !newRows.some((nr) => nr.getRowId() === r.getRowId())
                && !this.rows.some((kr) => kr.getRowId() === r.getRowId())
            ) {
                // TODO: new Row erzeugen, um Referenzen zu vermeiden
                newRows.push(r);
            }
        });
        if (newRows.length) {
            this.rows.splice(index, 0, ...newRows);
        }
    }

    public replaceRows(replaceRows: Array<[string, Row]>): Row[] {
        let replacedRows = [];
        replaceRows.forEach((r) => {
            let replaceRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[0]);
            if (replaceRowIndex !== -1) {
                const checkNewRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[1].getRowId());
                if (checkNewRowIndex !== -1) {
                    this.rows.splice(checkNewRowIndex, 1);
                    if (checkNewRowIndex < replaceRowIndex) {
                        replaceRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[0]);
                    }
                }

                // TODO: new Row erzeugen, um Referenzen zu vermeiden
                replacedRows = [...replacedRows, ...this.rows.splice(replaceRowIndex, 1, r[1])];
            }
        });
        return replacedRows;
    }

    public getColumns(): Column[] {
        return [...this.columns];
    }

    public getColumn(columnId: string): Column {
        return this.columns.find((r) => r.getColumnId() === columnId);
    }

    public removeColumns(columnIds: string[]): Column[] | IColumnConfiguration[] {
        const removedColumns = [];
        if (!this.initialized) {
            this.columnConfigurations = this.columnConfigurations.filter((cc) => {
                if (columnIds.some((id) => id === cc.property)) {
                    removedColumns.push(cc);
                    return false;
                } else {
                    return true;
                }
            });
        } else {
            this.columns = this.columns.filter((c) => {
                if (columnIds.some((id) => id === c.getColumnId())) {
                    removedColumns.push(c);
                    return false;
                } else {
                    return true;
                }
            });
            this.reload(true, false);
        }
        return removedColumns;
    }

    public removeAdditonalColumns(): void {
        this.removeColumns(this.additionalColumnConfigurations.map((c) => c.id));
    }

    public async addAdditionalColumns(additionalColumnConfigs: IColumnConfiguration[]): Promise<void> {
        if (!this.initialized) {
            if (!this.additionalColumnConfigurations) {
                this.additionalColumnConfigurations = [...additionalColumnConfigs];
            } else {
                this.additionalColumnConfigurations.push(...additionalColumnConfigs);
            }
        } else {
            for (const c of additionalColumnConfigs) {
                if (!this.hasColumn(c.property)) {
                    await this.createColumn(c);
                    this.updateRowValues();
                }
            }

            this.reload(true, false);
        }
    }

    private updateRowValues(): void {
        this.rows.forEach((r) => r.updateValues());
    }

    private hasColumn(id: string): boolean {
        return this.columns.some((kr) => kr.getColumnId() === id);
    }

    public getFilterValue(): string {
        return this.filterValue;
    }

    public getFilterCriteria(): UIFilterCriterion[] {
        return this.filterCriteria;
    }

    public setFilter(filterValue?: string, filterCriteria?: UIFilterCriterion[]): void {
        this.filterValue = filterValue;
        this.filterCriteria = filterCriteria;
        this.saveTableState();
    }

    public async filter(silent?: boolean): Promise<void> {
        if (this.isBackendFilterSupported() && !this.hasAdditionalHandler()) {
            EventService.getInstance().publish(
                TableEvent.TABLE_WAITING_START, new TableEventData(this.getTableId())
            );
            const criteria: FilterCriteria[] = await this.prepareBackendFilterCriteria();
            await this.getContentProvider().setFilter(criteria);
            EventService.getInstance().publish(
                TableEvent.TABLE_WAITING_END, new TableEventData(this.getTableId())
            );
        } else {
            if (this.isFilterDefined(this.filterValue, this.filterCriteria)) {
                this.filteredRows = [];
                const rows = [...this.rows];
                for (const row of rows) {
                    const match = await row.filter(this.filterValue, this.filterCriteria);
                    if (match) {
                        this.filteredRows.push(row);
                    }
                }
            } else {
                this.filteredRows = null;
                for (const row of this.rows) {
                    await row.filter(null, null);
                }
            }

            await this.filterColumns();

        }
        EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
        EventService.getInstance().publish(TableEvent.TABLE_FILTERED, new TableEventData(this.getTableId()));
    }

    private async filterColumns(): Promise<void> {
        for (const column of this.getColumns()) {
            const filter: [string, UIFilterCriterion[]] = column.getFilter();
            if (this.isFilterDefined(filter[0], filter[1])) {
                const rows: Row[] = [];
                if (filter[0] && filter[0] !== '') {
                    filter[1] = [
                        new UIFilterCriterion(column.getColumnId(), SearchOperator.CONTAINS, filter[0], false, true)
                    ];
                }
                for (const row of this.getRows()) {
                    const match = await row.filter(null, filter[1]);
                    if (match) {
                        rows.push(row);
                    }
                }
                this.filteredRows = rows;
            }
        }
    }

    private isFilterDefined(value: string, criteria: UIFilterCriterion[]): boolean {
        return (value && value !== '') || (criteria && criteria.length !== 0);
    }

    private async prepareBackendFilterCriteria(): Promise<FilterCriteria[]> {
        const criteria: FilterCriteria[] = [];
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(this.getObjectType());
        if (this.filterValue) {
            if (service) {
                const fulltextFilter = await service.prepareFullTextFilter(this.filterValue);
                if (fulltextFilter) {
                    criteria.push(...fulltextFilter);
                }
            }
        }
        if (this.filterCriteria) {
            criteria.push(...this.filterCriteria.map(
                (c) => new FilterCriteria(c.property, c.operator, undefined, FilterType.AND, c.value)
            ));
        }
        for (const column of this.getColumns()) {
            const filter: [string, UIFilterCriterion[]] = column.getFilter();
            if (this.isFilterDefined(filter[0], filter[1])) {
                if (filter[0]) {
                    let property = column.getColumnId();
                    // switch to "real" search property if needed (e.g. TypeID => Type)
                    if (service) {
                        property = await service.getFilterAttribute(
                            property,
                            (column.getColumnConfiguration() as DefaultDepColumnConfiguration).dep
                        );
                    }
                    criteria.push(new FilterCriteria(
                        property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, filter[0]
                    ));
                }
                if (filter[1]) {
                    const criteriaPromises = [];
                    filter[1].forEach((c) => {
                        criteriaPromises.push(
                            new Promise(async (resolve) => {
                                // switch to "real" search property if needed
                                let property = c.property;
                                if (service) {
                                    property = await service.getFilterAttribute(
                                        property,
                                        (column.getColumnConfiguration() as DefaultDepColumnConfiguration).dep
                                    );
                                }
                                resolve(new FilterCriteria(property, c.operator, undefined, FilterType.AND, c.value));
                            })
                        );
                    });
                    criteria.push(...await Promise.all(criteriaPromises));
                };
            }
        }
        return criteria;
    }

    public async setSort(columnId: string, sortOrder: SortOrder): Promise<void> {
        if (this.sortColumnId !== columnId || this.sortOrder !== sortOrder) {
            this.sortColumnId = columnId;
            this.sortOrder = sortOrder;

            this.getColumns().forEach((c) => c.setSortOrder(null));
            const column = this.getColumn(columnId);
            if (column) {
                column.setSortOrder(sortOrder);
            }
            this.saveTableState();
        }
    }

    public async sort(columnId: string, sortOrder: SortOrder, silent?: boolean): Promise<void> {
        this.setSort(columnId, sortOrder);

        // with handler a combined request is not supported now, so use "frontend sort"
        if (this.isBackendSortSupported() && !this.hasAdditionalHandler()) {
            EventService.getInstance().publish(
                TableEvent.TABLE_WAITING_START, new TableEventData(this.getTableId(), null, columnId)
            );
            await this.getContentProvider().setSort(this.sortColumnId, this.sortOrder);
            EventService.getInstance().publish(
                TableEvent.TABLE_WAITING_END, new TableEventData(this.getTableId(), null, columnId)
            );
        } else {
            await this.doTableSort();
        }

        if (!silent) {
            EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
            EventService.getInstance().publish(
                TableEvent.SORTED, new TableEventData(this.getTableId(), null, columnId)
            );
        }
    }

    private async doTableSort(): Promise<void> {
        const promises = [];
        this.getRows(true).forEach((r) => promises.push(r.getCell(this.sortColumnId)?.initDisplayValue()));
        await Promise.all(promises);

        const column = this.getColumn(this.sortColumnId);
        if (column) {
            const dataType = column.getColumnConfiguration().dataType || DataType.STRING;

            if (this.filteredRows) {
                this.filteredRows = TableSortUtil.sort(this.filteredRows, this.sortColumnId, this.sortOrder, dataType);
                for (const row of this.filteredRows) {
                    row.sortChildren(this.sortColumnId, this.sortOrder, dataType);
                }
            } else {
                this.rows = TableSortUtil.sort(this.rows, this.sortColumnId, this.sortOrder, dataType);
                for (const row of this.rows) {
                    row.sortChildren(this.sortColumnId, this.sortOrder, dataType);
                }
            }
        }
    }

    public async initDisplayRows(): Promise<void> {
        const rows = this.getRows();
        const promises = [];
        for (let i = 0; i < this.getRows(true).length; i++) {
            if (rows[i]) {
                promises.push(rows[i].initializeDisplayValues());
            }
        }

        await Promise.all(promises);
    }

    public setRowSelection(rowIds: string[]): void {
        this.getRows(true).forEach((r) => {
            if (rowIds.some((rId) => rId === r.getRowId())) {
                r.select();
            } else {
                r.select(false);
            }
        });
    }

    public setRowSelectionByObject(objects: any[]): void {
        this.selectNone(true);
        objects.forEach((o) => {
            const row = this.getRowByObject(o);
            if (row) {
                row.select();
            }
        });
    }

    public selectAll(withoutFilter: boolean = false): void {
        this.getRows(withoutFilter).forEach((r) => r.select(undefined, true, withoutFilter, false));
    }

    public selectNone(withoutFilter: boolean = false): void {
        this.getRows(withoutFilter).forEach((r) => r.select(false, true, withoutFilter, false));
    }

    public selectRowByObject(object: any, select?: boolean): void {
        const row = this.getRowByObject(object);
        if (row) {
            row.select(select);
        }
    }

    public setRowsSelectableByObject(objects: any[], selectable: boolean): void {
        objects.forEach((o) => {
            const row = this.getRowByObject(o);
            if (row) {
                row.selectable(selectable);
            }
        });
    }

    private getRowByObject(object: any): Row {
        return this.rows.filter((r) => r.getRowObject() !== null && typeof r.getRowObject() !== 'undefined')
            .find((r) => r.getRowObject().getObject() && r.getRowObject().getObject().equals(object));
    }

    public getRowSelectionState(all?: boolean): SelectionState {
        const selectableCount = this.getRows(all).filter((r) => r.isSelectable()).length;
        const selectedCount = this.getRows(all).filter((r) => r.isSelected()).length;
        let selectionState = SelectionState.ALL;
        if (selectedCount < selectableCount) {
            selectionState = SelectionState.INDETERMINATE;
        }
        if (selectedCount === 0) {
            selectionState = SelectionState.NONE;
        }
        return selectionState;
    }

    public reload(
        keepSelection: boolean = false, sort: boolean = true, relevantHandlerConfigIds?: string[]
    ): Promise<void> {
        if (this.reloadPromise) {
            return this.reloadPromise;
        }

        this.reloadPromise = new Promise<void>(async (resolve, reject) => {
            EventService.getInstance().publish(TableEvent.RELOAD, new TableEventData(this.getTableId()));
            let selectedRows: Row[] = [];
            if (keepSelection) {
                selectedRows = this.getSelectedRows(true);
            }
            await this.prepareAdditionalSearchColumns();

            await this.loadRowData(relevantHandlerConfigIds);

            if (this.columns && !!this.columns.length) {
                this.columns.forEach((c) =>
                    this.rows.forEach((r) => {
                        r.addCell(new TableValue(c.getColumnId(), null));
                    })
                );
            }
            if (keepSelection && !!selectedRows.length) {
                // TODO: get selection without object
                selectedRows.map(
                    (r) => r.getRowObject().getObject()
                ).forEach(
                    (o) => this.selectRowByObject(o)
                );
            }

            if (
                (!this.isBackendSortSupported() || this.hasAdditionalHandler()) &&
                sort && this.sortColumnId && this.sortOrder
            ) {
                await this.sort(this.sortColumnId, this.sortOrder);
            }

            // prevent reload loop if backend filtering is used
            if (
                (!this.isBackendFilterSupported() || this.hasAdditionalHandler()) &&
                this.isFiltered()
            ) {
                this.filter();
            }

            this.toggleFirstRow();
            await this.initDisplayRows();
            EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
            EventService.getInstance().publish(TableEvent.RELOADED, new TableEventData(this.getTableId()));

            resolve();
            this.reloadPromise = null;
        });

        return this.reloadPromise;
    }

    public switchColumnOrder(): void {
        this.columns = this.columns.reverse();
        if (this.getTableConfiguration().fixedFirstColumn) {
            const column = this.columns.splice(this.columns.length - 1, 1);
            this.columns.unshift(column[0]);
        }

        EventService.getInstance().publish(TableEvent.RERENDER_TABLE, new TableEventData(this.getTableId()));
    }

    public resetFilter(doFilter?: boolean): void {
        this.setFilter(null, null);
        this.getColumns().forEach((c) => c.filter(null, null, false));
        if (this.isBackendFilterSupported() && !this.hasAdditionalHandler()) {
            // filter if necessary else prevent it, but set it anyway
            this.getContentProvider().setFilter(null, doFilter || false);
        } else if (doFilter) {
            this.filter();
        }
    }

    public isFiltered(): boolean {
        return this.isFilterDefined(this.filterValue, this.filterCriteria) ||
            this.getColumns().some((c) => c.isFiltered());
    }

    public async setRowObject(row: Row, rowObject: RowObject): Promise<void> {
        row.setRowObject(rowObject);
        await row.initializeDisplayValues();
        EventService.getInstance().publish(
            TableEvent.ROW_VALUE_CHANGED,
            new TableEventData(this.getTableId(), row.getRowId())
        );
    }

    public updateRowObject(object: KIXObject): void {
        const row = this.getRowByObject(object);
        if (row) {
            row.getRowObject().updateObject(object);
            EventService.getInstance().publish(
                TableEvent.ROW_VALUE_CHANGED,
                new TableEventData(this.getTableId(), row.getRowId())
            );
        }
    }

    public async setRowObjectValues(values: Array<[any, [string, any]]>): Promise<void> {
        for (const v of values) {
            const row = this.getRowByObject(v[0]);
            if (row) {
                const value = v[1];
                row.getRowObject().addValue(new TableValue(value[0], value[1]));
                const cell = row.getCell(value[0]);
                if (cell) {
                    await cell.setValue(new TableValue(value[0], value[1]));
                } else {
                    row.addCell(new TableValue(value[0], value[1], value[1]));
                }
                EventService.getInstance().publish(
                    TableEvent.ROW_VALUE_CHANGED,
                    new TableEventData(this.getTableId(), row.getRowId())
                );
            }
        }
    }

    public setRowObjectValueState(objects: any[], state: ValueState): void {
        if (objects && !!objects.length) {
            objects.forEach((o) => {
                const row = this.getRowByObject(o);
                if (row) {
                    row.setValueState(state);
                }
            });
        }
    }

    public getRowByObjectId(objectId: string | number): Row {
        const row = this.rows.find((r) => {
            const object = r.getRowObject().getObject();
            return object && object.ObjectId === objectId;
        });
        return row;
    }

    public getRowCount(all?: boolean): number {
        let count = 0;
        this.getRows(all).forEach((r) => count += r.getRowCount());
        return count;
    }

    public async loadMore(): Promise<void> {
        EventService.getInstance().publish(
            TableEvent.TABLE_WAITING_START, new TableEventData(this.getTableId())
        );
        if (!this.isBackendFilterSupported()) {
            this.resetFilter();
        }
        await this.contentProvider.loadMore();
        EventService.getInstance().publish(
            TableEvent.TABLE_WAITING_END, new TableEventData(this.getTableId())
        );
    }

    public isBackendSortSupported(): boolean {
        return this.getContentProvider()?.isBackendSortSupported();
    }

    public isBackendFilterSupported(): boolean {
        return this.getContentProvider()?.isBackendFilterSupported();
    }

}

class TableState {

    public constructor(
        public filterValue: string,
        public filterCriteria: UIFilterCriterion[],
        public toggledRows: string[],
        public selectedRows: string[],
        public columnsizes: Array<[string, number]>,
        public sortColumnId: string,
        public sortOrder: SortOrder
    ) { }

}
