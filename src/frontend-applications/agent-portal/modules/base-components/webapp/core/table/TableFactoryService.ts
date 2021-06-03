/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from './TableFactory';
import { Table } from '.';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { ContextService } from '../ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';

export class TableFactoryService {

    private static INSTANCE: TableFactoryService;

    public static getInstance(): TableFactoryService {
        if (!TableFactoryService.INSTANCE) {
            TableFactoryService.INSTANCE = new TableFactoryService();
        }

        return TableFactoryService.INSTANCE;
    }

    private constructor() {
        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'table-factory-service-listener',
            contextChanged: this.contextChanged.bind(this),
            contextRegistered: () => { return; }
        });
    }


    private contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean, oldContext: Context
    ): void {
        const mainContext = ContextService.getInstance().getActiveContext();
        const dialogContext = ContextService.getInstance().getActiveContext();
        if (oldContext) {
            if (type === oldContext.descriptor.contextType) {
                let switchContext = false;
                if (type === ContextType.MAIN) {
                    switchContext = mainContext && contextId !== mainContext.contextId;
                } else if (type === ContextType.DIALOG) {
                    switchContext = dialogContext && contextId !== dialogContext.contextId;
                }

                if (switchContext) {
                    const oldContextid = oldContext.contextId;

                    if (this.contextTableInstances.has(oldContextid)) {
                        this.contextTableInstances.get(oldContextid).forEach((table) => {
                            table.destroy();
                        });
                        this.contextTableInstances.delete(oldContextid);
                    }
                }
            }
        }
    }

    public deleteDialogTables(dialogContextId: string): void {
        if (this.contextTableInstances.has(dialogContextId)) {
            this.contextTableInstances.get(dialogContextId).forEach((table) => {
                table.destroy();
            });
            this.contextTableInstances.delete(dialogContextId);
        }
    }

    private factories: TableFactory[] = [];

    private contextTableInstances: Map<string, Map<string, Table>> = new Map();

    public registerFactory(factory: TableFactory): void {
        if (this.factories.some((f) => f.isFactoryFor(factory.objectType))) {
            console.warn(`Redudant TableFactory for type ${factory.objectType}`);
        }

        this.factories.push(factory);
    }

    public getTableFactory<T extends TableFactory>(objectType: KIXObjectType | string): T {
        const factory = this.factories.find((f) => f.isFactoryFor(objectType));
        return factory as T;
    }

    public async createTable(
        tableKey: string, objectType: KIXObjectType | string, tableConfiguration?: TableConfiguration,
        objectIds?: Array<number | string>, contextId?: string, defaultRouting?: boolean,
        defaultToggle?: boolean, short: boolean = false, reload: boolean = true, recreate: boolean = true,
        objects: KIXObject[] = null
    ): Promise<Table> {
        let table: Table;

        const context = ContextService.getInstance().getActiveContext();
        let tableContextId: string;
        if (context) {
            tableContextId = context.contextId;
            if (!recreate && this.contextTableInstances.has(tableContextId)) {
                const tableInstances = this.contextTableInstances.get(tableContextId);
                if (tableInstances.has(tableKey)) {
                    table = tableInstances.get(tableKey);
                    if (reload) {
                        await table.reload(true);
                    }
                }
            }
        }

        if (!table) {
            const factory = this.factories.find((f) => f.isFactoryFor(objectType));
            if (factory) {
                table = await factory.createTable(
                    tableKey, tableConfiguration, objectIds, contextId,
                    defaultRouting, defaultToggle, short, objectType, objects
                );

                if (tableContextId) {
                    if (!this.contextTableInstances.has(tableContextId)) {
                        this.contextTableInstances.set(tableContextId, new Map());
                    }
                    this.contextTableInstances.get(tableContextId).set(tableKey, table);
                }
            }
        }
        return table;
    }

    public destroyTable(tableKey: string, asRegEx: boolean = false): void {
        for (const contextTableList of this.contextTableInstances) {
            if (contextTableList[1]) {
                if (asRegEx) {
                    const tabelKeyRegex = new RegExp(tableKey);
                    contextTableList[1].forEach((table, key) => {
                        if (key.match(tabelKeyRegex)) {
                            table.destroy();
                            contextTableList[1].delete(key);
                        }
                    });
                } else if (contextTableList[1].has(tableKey)) {
                    contextTableList[1].get(tableKey).destroy();
                    contextTableList[1].delete(tableKey);
                    break;
                }
            }
        }
    }

    public getDefaultColumnConfiguration(objectType: KIXObjectType | string, property: string): IColumnConfiguration {
        const factory = this.factories.find((f) => f.objectType === objectType);
        return factory ? factory.getDefaultColumnConfiguration(property) : null;
    }
}
