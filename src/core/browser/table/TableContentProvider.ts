/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableContentProvider } from "./ITableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, KIXObject, KIXObjectProperty } from "../../model";
import { ITable } from "./ITable";
import { ContextService } from "../context";
import { IRowObject } from "./IRowObject";
import { KIXObjectService } from "../kix";
import { RowObject } from "./RowObject";
import { TableValue } from "./TableValue";
import { TranslationService } from "../i18n/TranslationService";

export class TableContentProvider<T = any> implements ITableContentProvider<T> {

    protected initialized: boolean = false;

    protected useCache: boolean = true;

    public constructor(
        protected objectType: KIXObjectType,
        protected table: ITable,
        protected objectIds: Array<number | string>,
        protected loadingOptions: KIXObjectLoadingOptions,
        protected contextId?: string
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

    private objectChanged(id: number | string, object: KIXObject, objectType: KIXObjectType): void {
        if (objectType === this.objectType) {
            this.table.reload(true);
        }
    }

    private objectListChanged(objectType: KIXObjectType, filteredObjectList: KIXObject[]): void {
        if (objectType === this.objectType) {
            this.table.reload(true);
        }
    }

    public getObjectType(): KIXObjectType {
        return this.objectType;
    }

    public async loadData(): Promise<Array<IRowObject<T>>> {
        let objects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            objects = context ? await context.getObjectList(this.objectType) : [];
        } else {
            if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
                objects = await KIXObjectService.loadObjects<KIXObject>(
                    this.objectType, this.objectIds, this.loadingOptions, null, false, this.useCache
                );
            }
        }

        const rowObjectPromises: Array<Promise<RowObject<T>>> = [];
        if (objects) {
            for (const o of objects) {
                rowObjectPromises.push(new Promise<RowObject<T>>(async (resolve, reject) => {
                    const values: TableValue[] = [];

                    for (const property in o) {
                        if (o.hasOwnProperty(property)) {
                            const value = await this.getTableValue(o, property);
                            values.push(value);
                        }
                    }
                    await this.addSpecificValues(values, o);

                    resolve(new RowObject<T>(values, o));
                }));
            }
        }

        const rowObjects = await Promise.all(rowObjectPromises);
        return rowObjects;
    }

    protected async getTableValue(object: any, property: string): Promise<TableValue> {
        let displayValue = null;
        if (object[KIXObjectProperty.DISPLAY_VALUES]) {
            const kixObject = object as KIXObject;
            const value = kixObject.displayValues.find((dv) => dv[0] === property);
            if (value) {
                const text = await TranslationService.translate(value[1]);
                displayValue = text;
            }

        }
        return new TableValue(property, object[property], displayValue);
    }

    protected async addSpecificValues(values: TableValue[], object: any): Promise<any> {
        return;
    }
}
