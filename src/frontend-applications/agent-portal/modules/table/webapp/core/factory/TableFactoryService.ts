/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from './TableFactory';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { Context } from '../../../../../model/Context';
import { IdService } from '../../../../../model/IdService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { Table } from '../../../model/Table';

export class TableFactoryService {

    private static INSTANCE: TableFactoryService;

    private subscriber: IEventSubscriber;

    public static getInstance(): TableFactoryService {
        if (!TableFactoryService.INSTANCE) {
            TableFactoryService.INSTANCE = new TableFactoryService();
        }

        return TableFactoryService.INSTANCE;
    }

    private constructor() {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (context: Context): void => {
                this.deleteContextTables(context?.contextId);
            }
        };
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
    }

    public deleteContextTables(contextId: string): void {
        if (this.contextTableInstances.has(contextId)) {
            this.contextTableInstances.get(contextId).forEach((table) => {
                table.destroy();
                table.deleteTableState();
            });
            this.contextTableInstances.delete(contextId);
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
