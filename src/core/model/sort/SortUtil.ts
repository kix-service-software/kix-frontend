import { SortOrder } from './SortOrder';
import { DataType } from '..';

export class SortUtil {

    public static sortObjects<T>(
        objects: T[], property: string, dataType: DataType, sortOrder: SortOrder = SortOrder.UP
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
                break;
            case DataType.NUMBER:
                sort = SortUtil.compareNumber(a[property], b[property], sortOrder);
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

    public static compareNumber(a: number, b: number, sortOrder: SortOrder = SortOrder.UP): number {
        let sort = 0;
        if (typeof a !== 'number') {
            sort = -1;
        } else if (typeof b !== 'number') {
            sort = 1;
        } else {
            sort = a - b;
        }
        return sortOrder === SortOrder.DOWN ? sort * (-1) : sort;
    }

    public static compareDate(a: string, b: string, sortOrder: SortOrder = SortOrder.UP): number {
        let sort = 0;
        if (a === undefined) {
            sort = -1;
        } else if (b === undefined) {
            sort = 1;
        } else {
            const DateA: Date = new Date(a);
            const DateB: Date = new Date(b);
            sort = (DateA.getTime() - DateB.getTime());
        }
        return sortOrder === SortOrder.DOWN ? sort * (-1) : sort;
    }

}
