/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableFactory } from "./ITableFactory";
import { KIXObjectType, KIXObjectProperty, DataType, KIXObject } from "../../model";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { TableConfiguration } from "./TableConfiguration";
import { ITable } from "./ITable";
import { DefaultColumnConfiguration } from "./DefaultColumnConfiguration";
import { IColumn } from "./IColumn";
import { IRow } from "./IRow";

export abstract class TableFactory implements ITableFactory {

    public abstract objectType: KIXObjectType;

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === this.objectType;
    }

    public abstract createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectids?: Array<string | number>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType
    ): ITable;

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case KIXObjectProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 350, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            case 'ICON':
                config = new DefaultColumnConfiguration(
                    property, false, true, false, false, 41, false, false, false, undefined, false
                );
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true, true);
                break;
            case KIXObjectProperty.CHANGE_TIME:
            case KIXObjectProperty.CREATE_TIME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
                );
                break;
            case 'LinkedAs':
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 120, true, true, true, DataType.STRING
                );
                break;
            default:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true);
        }
        return config;
    }

    public getColumnFilterValues<T extends KIXObject = any>(rows: IRow[], column: IColumn): Array<[T, number]> {
        return TableFactory.getColumnFilterValues(rows, column);
    }

    public static getColumnFilterValues<T extends KIXObject = any>(
        rows: IRow[], column: IColumn, values: Array<[T, number]> = []
    ): Array<[T, number]> {
        rows.forEach((r) => {
            const cell = r.getCell(column.getColumnId());
            if (cell) {
                let cellValues = [];
                const cellValue = cell.getValue();
                if (Array.isArray(cellValue.objectValue)) {
                    cellValues = cellValue.objectValue;
                } else {
                    cellValues.push(cellValue.objectValue);
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

}
