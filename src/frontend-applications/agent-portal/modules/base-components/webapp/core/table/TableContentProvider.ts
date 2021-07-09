/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableContentProvider } from './ITableContentProvider';
import { Table } from './Table';
import { RowObject } from './RowObject';
import { TableValue } from './TableValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { ContextService } from '../ContextService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectService } from '../KIXObjectService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { LabelService } from '../LabelService';
import { PlaceholderService } from '../PlaceholderService';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchService } from '../../../../search/webapp/core';

export class TableContentProvider<T = any> implements ITableContentProvider<T> {

    protected initialized: boolean = false;

    protected useCache: boolean = true;

    public constructor(
        protected objectType: KIXObjectType | string,
        protected table: Table,
        protected objectIds: Array<number | string>,
        protected loadingOptions: KIXObjectLoadingOptions,
        protected contextId?: string,
        protected objects?: KIXObject[]
    ) { }

    public async initialize(): Promise<void> {
        if (!this.initialized) {
            if (this.contextId) {
                const context = ContextService.getInstance().getActiveContext();
                if (context) {
                    context.registerListener(this.table.getTableId() + '-content-provider', {
                        sidebarLeftToggled: () => { return; },
                        filteredObjectListChanged: () => { return; },
                        objectChanged: this.objectChanged.bind(this),
                        objectListChanged: this.objectListChanged.bind(this),
                        sidebarRightToggled: () => { return; },
                        scrollInformationChanged: () => { return; },
                        additionalInformationChanged: () => { return; }
                    });
                }
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
        }
    }

    private objectChanged(id: number | string, object: KIXObject, objectType: KIXObjectType | string): void {
        if (objectType === this.getContextObjectType()) {
            this.table.reload(true);
        }

    }

    private objectListChanged(objectType: KIXObjectType | string, filteredObjectList: KIXObject[]): void {
        if (objectType === this.getContextObjectType()) {
            this.table.reload(true);
        }
    }

    protected getContextObjectType(): KIXObjectType | string {
        return this.objectType;
    }

    public getObjectType(): KIXObjectType | string {
        return this.objectType;
    }

    public async loadData(): Promise<Array<RowObject<T>>> {
        let objects = [];

        if (this.objects) {
            objects = this.objects;
        } else if (this.table.getTableConfiguration().searchId) {
            objects = await SearchService.getInstance().executeSearchCache(this.table.getTableConfiguration().searchId);
        } else if (this.contextId && !this.objectIds) {
            const context = ContextService.getInstance().getActiveContext();
            objects = context ? await context.getObjectList(this.objectType) : [];
        } else if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
            const forceIds = (this.objectIds && this.objectIds.length > 0) ? true : false;
            const loadingOptions = await this.prepareLoadingOptions();
            objects = await KIXObjectService.loadObjects<KIXObject>(
                this.objectType, this.objectIds, loadingOptions, null, forceIds, this.useCache
            );
        }

        if (!objects) {
            objects = [];
        }

        return await this.getRowObjects(objects);
    }

    public async getRowObjects(objects: T[]): Promise<RowObject[]> {
        const rowObjectPromises: Array<Promise<RowObject<T>>> = [];
        if (objects) {
            for (const o of objects) {
                rowObjectPromises.push(new Promise<RowObject<T>>(async (resolve, reject) => {
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {

                        // ignore dynamic fields, they will be added in prepareSpecificValues
                        if (!column.property?.startsWith(`${KIXObjectProperty.DYNAMIC_FIELDS}.`)) {
                            const tableValue = new TableValue(column.property, o[column.property], null, null, null);
                            values.push(tableValue);
                        }
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

        const rowObjects = await Promise.all(rowObjectPromises);
        return rowObjects;
    }

    protected async prepareSpecificValues(values: TableValue[], object: any): Promise<void> {
        if (Array.isArray(object[KIXObjectProperty.DYNAMIC_FIELDS])) {
            for (const dfv of object[KIXObjectProperty.DYNAMIC_FIELDS] as DynamicFieldValue[]) {
                let dfValue: [string[], string, string[]];

                dfValue = await LabelService.getInstance().getDFDisplayValues(object.KIXObjectType, dfv);

                values.push(new TableValue(
                    `${KIXObjectProperty.DYNAMIC_FIELDS}.${dfv.Name}`,
                    dfValue && dfValue[0] ? dfValue[0] : dfv.Value,
                    dfValue && dfValue[1] ? dfValue[1] : dfv.DisplayValue.toString()
                ));
            }
        }
    }

    protected hasChildRows(rowObject: RowObject): boolean {
        return false;
    }

    protected async addChildRows(rowObject: RowObject): Promise<void> {
        return;
    }

    protected async prepareLoadingOptions(): Promise<KIXObjectLoadingOptions> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [],
            this.loadingOptions ? this.loadingOptions.sortOrder : null,
            this.loadingOptions ? this.loadingOptions.limit : null,
            this.loadingOptions ? this.loadingOptions.includes : null,
            this.loadingOptions ? this.loadingOptions.expands : null,
            this.loadingOptions ? this.loadingOptions.query : null
        );

        if (this.loadingOptions && Array.isArray(this.loadingOptions.filter)) {
            const context = ContextService.getInstance().getActiveContext();
            const contextObject = await context.getObject();
            for (const criterion of this.loadingOptions.filter) {
                if (typeof criterion.value === 'string') {
                    const value = await PlaceholderService.getInstance().replacePlaceholders(
                        criterion.value, contextObject
                    );
                    const preparedCriterion = new FilterCriteria(
                        criterion.property, criterion.operator, criterion.type, criterion.filterType, value
                    );
                    loadingOptions.filter.push(preparedCriterion);
                } else {
                    loadingOptions.filter.push(criterion);
                }
            }
        }
        return loadingOptions;
    }
}
