/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../model";
import { ITable, TableConfiguration } from "../table";
import { IColumnConfiguration } from "./IColumnConfiguration";

export interface ITableFactory {

    objectType: KIXObjectType;

    isFactoryFor(objectType: KIXObjectType): boolean;

    createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectids?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType
    ): ITable;

    getDefaultColumnConfiguration(property: string): IColumnConfiguration;
}
