/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { DataType } from '../../../../../model/DataType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ExtendedTableFactory } from './ExtendedTableFactory';
import { SearchCache } from '../../../../search/model/SearchCache';
import { SearchProperty } from '../../../../search/model/SearchProperty';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';
import { Column } from '../../../model/Column';
import { Row } from '../../../model/Row';
import { Table } from '../../../model/Table';

export abstract class TableFactory {

    public abstract objectType: KIXObjectType | string;

    protected extendedTableFactories: ExtendedTableFactory[] = [];

    public addExtendedTableFactory(factory: ExtendedTableFactory): void {
        this.extendedTableFactories.push(factory);
    }

    public isFactoryFor(objectType: KIXObjectType | string): boolean {
        return objectType === this.objectType;
    }

    public abstract createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<string | number>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType | string, objects?: KIXObject[]
    ): Promise<Table>;

    public getDefaultColumnConfiguration(property: string, translatable: boolean = true): IColumnConfiguration {
        let config;

        for (const extendedFactory of this.extendedTableFactories) {
            config = extendedFactory.getDefaultColumnConfiguration(property, translatable);
            if (config) {
                return config;
            }
        }

        switch (property) {
            case KIXObjectProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    null, null, null,
                    property, true, false, true, false, 350, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            case 'ICON':
                config = new DefaultColumnConfiguration(
                    null, null, null,
                    property, false, true, false, false, 41, false, false, false, undefined, false
                );
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(
                    null, null, null,
                    property, true, false, true, false, 150, true, true, true);
                break;
            case KIXObjectProperty.CHANGE_TIME:
            case KIXObjectProperty.CREATE_TIME:
                config = new DefaultColumnConfiguration(
                    null, null, null,
                    property, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
                );
                break;
            case 'LinkedAs':
                config = new DefaultColumnConfiguration(
                    null, null, null,
                    property, true, false, true, false, 120, true, true, true, DataType.STRING
                );
                break;
            default:
                config = new DefaultColumnConfiguration(
                    undefined, undefined, undefined, property, true, false, true, false, 150, true, true,
                    undefined, undefined, undefined, undefined, undefined, translatable
                );
        }
        return config;
    }

    public getColumnFilterValues<T extends KIXObject = any>(rows: Row[], column: Column): Array<[T, number]> {
        for (const extendedFactory of this.extendedTableFactories) {
            const extendedValues = extendedFactory.getColumnFilterValues(rows, column);
            if (extendedValues) {
                return extendedValues;
            }
        }
        return TableFactory.getColumnFilterValues(rows, column);
    }

    public static getColumnFilterValues<T extends KIXObject = any>(
        rows: Row[], column: Column, values: Array<[T, number]> = []
    ): Array<[T, number]> {
        rows.forEach((r) => {
            const cell = r.getCell(column.getColumnId());
            if (cell) {
                let cellValues = [];
                const cellValue = cell.getValue();
                if (Array.isArray(cellValue.objectValue)) {
                    cellValues = cellValue.objectValue;
                } else if (cellValue.objectValue !== null && typeof cellValue.objectValue !== 'undefined') {
                    cellValues.push(cellValue.objectValue);
                } else if (cellValue.displayValue) {
                    cellValues.push(cellValue.displayValue);
                }

                cellValues.forEach((value) => {
                    const existingValue = values.find((ev) => {
                        if (ev[0] instanceof KIXObject) {
                            return ev[0].equals(value);
                        }
                        return ev[0] === value;
                    });
                    if (existingValue) {
                        existingValue[1] = existingValue[1] + 1;
                    } else {
                        values.push([value, 1]);
                    }
                });

            }
            const childRows = r.getChildren();
            if (childRows && !!childRows.length) {
                TableFactory.getColumnFilterValues(childRows, column, values);
            }
        });

        return values;
    }

    public async getDefaultColumnConfigurations(searchCache: SearchCache): Promise<IColumnConfiguration[]> {
        const columns: IColumnConfiguration[] = [];

        const criteria = searchCache.criteria.filter((c) => {
            return c.property !== SearchProperty.FULLTEXT
                && c.property !== TicketProperty.CLOSE_TIME
                && c.property !== TicketProperty.LAST_CHANGE_TIME;
        });


        for (const c of criteria) {
            const column = await this.getDefaultColumnConfiguration(c.property);
            columns.push(column);
        }

        return columns;
    }

}
