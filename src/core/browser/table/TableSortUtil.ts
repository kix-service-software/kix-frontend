import { IRow } from "./IRow";
import { SortOrder, DataType, SortUtil } from "../../model";
import { ICell } from "./ICell";
import { IColumn } from "./IColumn";

export class TableSortUtil {

    public static async sort(
        rows: IRow[], columnId: string, sortOrder: SortOrder, dataType: DataType
    ): Promise<IRow[]> {
        if (columnId && sortOrder && dataType) {

            rows = await TableSortUtil.sortRows(rows, columnId, dataType);

            if (sortOrder === SortOrder.DOWN) {
                rows = rows.reverse();
            }
        }
        return rows;
    }

    private static async sortRows(rows: IRow[], columnId: string, dataType: DataType): Promise<IRow[]> {
        const len = rows.length;
        for (let i = len - 1; i >= 0; i--) {
            for (let j = 1; j <= i; j++) {
                const cellA = rows[j - 1].getCell(columnId);
                const cellB = rows[j].getCell(columnId);
                const valueA = await TableSortUtil.getValueFromCell(cellA, dataType);
                const valueB = await TableSortUtil.getValueFromCell(cellB, dataType);

                const numberA = Number(valueA);
                const numberB = Number(valueB);

                let compare = 0;
                if (isNaN(numberA) || isNaN(numberB)) {
                    compare = SortUtil.compareValues(valueA, valueB, dataType);
                } else {
                    compare = valueA - valueB;
                }
                if (compare > 0) {
                    const temp = rows[j - 1];
                    rows[j - 1] = rows[j];
                    rows[j] = temp;
                }
            }
        }
        return rows;
    }

    private static getValueFromCell(cell: ICell, dataType: DataType): any {
        switch (dataType) {
            case DataType.DATE:
            case DataType.DATE_TIME:
                return cell.getValue().objectValue;
            default:
                return cell.getDisplayValue();
        }
    }


}
