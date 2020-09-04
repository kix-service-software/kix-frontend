/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Table } from '.';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Column } from './Column';
import { Row } from './Row';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';

export interface ITableFactory {

    objectType: KIXObjectType | string;

    isFactoryFor(objectType: KIXObjectType | string): boolean;

    createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType | string, objects?: KIXObject[]
    ): Table;

    getDefaultColumnConfiguration(property: string): IColumnConfiguration;

    getColumnFilterValues<T extends KIXObject = any>(rows: Row[], column: Column): Array<[T, number]>;
}
