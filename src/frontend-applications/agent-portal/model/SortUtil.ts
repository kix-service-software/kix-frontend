/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SortOrder } from './SortOrder';
import { DataType } from './DataType';

export class SortUtil {

    public static sortObjects<T>(
        objects: T[], property: string, dataType: DataType = DataType.STRING, sortOrder: SortOrder = SortOrder.UP
    ): T[] {
        if (objects && objects.length) {
            objects.sort((a, b) => SortUtil.compareObjects(a, b, property, dataType, sortOrder));
        }
        return objects;
    }

    public static compareObjects<T>(
        a: T, b: T, property: string, dataType: DataType, sortOrder: SortOrder = SortOrder.UP
    ): number {
        let sort = 0;
        switch (dataType) {
            case DataType.DATE:
            case DataType.DATE_TIME:
                sort = SortUtil.compareDate(a[property], b[property], sortOrder);
                if (sort === 0) {
                    sort = SortUtil.compareObjectByObjectId(a, b, sortOrder);
                }
                break;
            case DataType.NUMBER:
            case DataType.INTEGER:
                sort = SortUtil.compareNumber(a[property], b[property], sortOrder);
                if (sort === 0) {
                    sort = SortUtil.compareObjectByObjectId(a, b, sortOrder);
                }
                break;
            default:
                sort = SortUtil.compareString(a[property], b[property], sortOrder);
        }
        return sort;
    }

    public static compareValues(a: any, b: any, dataType: DataType, sortOrder: SortOrder = SortOrder.UP): number {
        let sort = 0;
        switch (dataType) {
            case DataType.DATE:
            case DataType.DATE_TIME:
                sort = SortUtil.compareDate(a, b, sortOrder);
                break;
            case DataType.NUMBER:
            case DataType.INTEGER:
                sort = SortUtil.compareNumber(a, b, sortOrder);
                break;
            default:
                sort = SortUtil.compareString(a, b, sortOrder);
        }
        return sortOrder === SortOrder.DOWN ? sort * (-1) : sort;
    }

    public static compareString(a: string, b: string, sortOrder: SortOrder = SortOrder.UP): number {
        let sort = 0;
        if (typeof a !== 'string') {
            sort = -1;
        } else if (typeof b !== 'string') {
            sort = 1;
        } else {
            sort = a.toString().localeCompare(b.toString(), [], { sensitivity: 'base' });
        }
        return sortOrder === SortOrder.DOWN ? sort * (-1) : sort;
    }

    public static compareNumber(
        a: any, b: any, sortOrder: SortOrder = SortOrder.UP, notNumberBefore: boolean = true
    ): number {
        let sort = 0;
        if (isNaN(Number(a))) {
            sort = notNumberBefore ? -1 : 1;
        } else if (isNaN(b)) {
            sort = notNumberBefore ? 1 : -1;
        } else {
            sort = Number(a) - Number(b);
        }
        return sortOrder === SortOrder.DOWN ? sort * (-1) : sort;
    }

    public static compareDate(a: string, b: string, sortOrder: SortOrder = SortOrder.UP): number {
        let sort = 0;
        if (a === undefined || a === '') {
            sort = -1;
        } else if (b === undefined || b === '') {
            sort = 1;
        } else {
            const dateA: Date = new Date(a);
            const dateB: Date = new Date(b);
            sort = (dateA.getTime() - dateB.getTime());
        }
        return sortOrder === SortOrder.DOWN ? sort * (-1) : sort;
    }

    public static compareObjectByObjectId<T>(a: T, b: T, sortOrder: SortOrder): number {
        let sort = 0;
        if (a['ObjectId']) {
            typeof a['ObjectId'] === 'number'
                ? sort = SortUtil.compareNumber(a['ObjectId'], b['ObjectId'], sortOrder)
                : sort = SortUtil.compareString(a['ObjectId'], b['ObjectId'], sortOrder);
        }
        return sort;
    }

}
