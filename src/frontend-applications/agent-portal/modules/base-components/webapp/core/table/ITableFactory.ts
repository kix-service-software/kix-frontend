/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITable } from ".";
import { IColumnConfiguration } from "../../../../../model/configuration/IColumnConfiguration";
import { TableConfiguration } from "../../../../../model/configuration/TableConfiguration";
import { IColumn } from "./IColumn";
import { IRow } from "./IRow";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObject } from "../../../../../model/kix/KIXObject";

export interface ITableFactory {

    objectType: KIXObjectType | string;

    isFactoryFor(objectType: KIXObjectType | string): boolean;

    createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectids?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType | string
    ): ITable;

    getDefaultColumnConfiguration(property: string): IColumnConfiguration;

    getColumnFilterValues<T extends KIXObject = any>(rows: IRow[], column: IColumn): Array<[T, number]>;
}
