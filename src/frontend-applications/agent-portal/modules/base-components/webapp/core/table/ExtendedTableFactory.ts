/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { Table } from './Table';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { Row } from './Row';
import { Column } from './Column';

export abstract class ExtendedTableFactory {

    public objectType: KIXObjectType | string;

    public isFactoryFor(objectType: string): boolean {
        return false;
    }

    public async modifiyTableConfiguation(
        tableConfiguration: TableConfiguration, useDefaultColumns: boolean
    ): Promise<void> {
        return;
    }

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<string | number>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: string, objects?: KIXObject[]
    ): Promise<Table> {
        return null;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return null;
    }

    public getColumnFilterValues<T extends KIXObject = any>(
        rows: Array<Row>, column: Column<any>
    ): Array<[T, number]> {
        return null;
    }

}
