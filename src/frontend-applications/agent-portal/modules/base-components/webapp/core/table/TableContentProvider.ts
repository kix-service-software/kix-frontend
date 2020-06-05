/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableContentProvider } from './ITableContentProvider';
import { ITable } from './ITable';
import { IRowObject } from './IRowObject';
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
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';

export class TableContentProvider<T = any> implements ITableContentProvider<T> {

    protected initialized: boolean = false;

    protected useCache: boolean = true;

    public constructor(
        protected objectType: KIXObjectType | string,
        protected table: ITable,
        protected objectIds: Array<number | string>,
        protected loadingOptions: KIXObjectLoadingOptions,
        protected contextId?: string,
        protected objects?: KIXObject[]
    ) { }

    public async initialize(): Promise<void> {
        if (!this.initialized) {
            if (this.contextId) {
                const context = await ContextService.getInstance().getContext(this.contextId);
                if (context) {
                    context.registerListener(this.table.getTableId() + '-content-provider', {
                        explorerBarToggled: () => { return; },
                        filteredObjectListChanged: () => { return; },
                        objectChanged: this.objectChanged.bind(this),
                        objectListChanged: this.objectListChanged.bind(this),
                        sidebarToggled: () => { return; },
                        scrollInformationChanged: () => { return; },
                        additionalInformationChanged: () => { return; }
                    });
                    this.initialized = true;
                }
            }
        }
    }

    public async destroy(): Promise<void> {
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
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

    public async loadData(): Promise<Array<IRowObject<T>>> {
        let objects = [];

        if (this.objects) {
            objects = this.objects;
        } else if (this.contextId && !this.objectIds) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            objects = context ? await context.getObjectList(this.objectType) : [];
        } else if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
            objects = await KIXObjectService.loadObjects<KIXObject>(
                this.objectType, this.objectIds, this.loadingOptions, null, false, this.useCache
            );
        }

        if (!objects) {
            objects = [];
        }

        const props = this.table.getColumns().map((c) => c.getColumnConfiguration().property);
        const propertyMap: Map<string, Map<any, TableValue>> = new Map();
        for (const p of props) {
            const column = this.table.getColumns().find((c) => c.getColumnConfiguration().property === p);
            const valueMap: Map<any, TableValue> = new Map();
            propertyMap.set(p, valueMap);
            for (const o of objects) {
                if (!valueMap.has(o[p])) {
                    const vm = await this.getTableValue(o, p, column.getColumnConfiguration());
                    valueMap.set(o[p], vm);
                }
            }
        }

        return await this.getRowObjects(objects, propertyMap);
    }

    protected async getRowObjects(objects: T[], propertyMap: Map<string, Map<any, TableValue>>): Promise<RowObject[]> {
        const rowObjectPromises: Array<Promise<RowObject<T>>> = [];
        if (objects) {
            for (const o of objects) {
                rowObjectPromises.push(new Promise<RowObject<T>>(async (resolve, reject) => {
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        const property = column.property;

                        if (o.hasOwnProperty(property)
                            && propertyMap.has(property)
                            && propertyMap.get(property).has(o[property])
                        ) {
                            const value = propertyMap.get(property).get(o[property]);
                            values.push(value);
                        } else if (!KIXObjectService.getDynamicFieldName(property)) {
                            const tableValue = await this.getTableValue(o, property, column);
                            values.push(tableValue);
                        }
                    }
                    await this.prepareSpecificValues(values, o);
                    const rowObject = new RowObject<T>(values, o);

                    if (this.hasChildRows(rowObject)) {
                        await this.addChildRows(rowObject, propertyMap);
                    }

                    resolve(rowObject);
                }));
            }
        }

        const rowObjects = await Promise.all(rowObjectPromises);
        return rowObjects;
    }

    protected async getTableValue(object: any, property: string, column: IColumnConfiguration): Promise<TableValue> {
        const showIcons = column ? column.showIcon : true;
        const translatable = column ? column.translatable : true;

        const displayValue = await LabelService.getInstance().getDisplayText(
            object, property, object[property], translatable
        );

        let icons = [];
        if (showIcons) {
            icons = await LabelService.getInstance().getIcons(object, property, null, true);
        }

        return new TableValue(property, object[property], displayValue, undefined, icons);
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

    protected async addChildRows(rowObject: RowObject, propertyMap: Map<string, Map<any, TableValue>>): Promise<void> {
        return;
    }
}
