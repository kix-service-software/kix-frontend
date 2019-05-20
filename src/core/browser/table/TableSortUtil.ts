import { IRow } from "./IRow";
import { SortOrder, DataType, SortUtil } from "../../model";

export class TableSortUtil {

    public static sort(
        rows: IRow[], columnId: string, sortOrder: SortOrder, dataType: DataType
    ): IRow[] {
        if (columnId && sortOrder && dataType) {
            rows.sort((a, b) => {
                const cellA = a.getCell(columnId);
                const cellB = b.getCell(columnId);
                const valueA = cellA.getValue().displayValue;
                const valueB = cellB.getValue().displayValue;

                const numberA = Number(valueA);
                const numberB = Number(valueB);

                let compare = 0;
                if (isNaN(numberA) || isNaN(numberB)) {
                    compare = SortUtil.compareValues(valueA, valueB, dataType);
                } else {
                    compare = numberA - numberB;
                }

                if (sortOrder === SortOrder.DOWN) {
                    compare = compare * (-1);
                }

                return compare;
            });

            // rows = TableSortUtil.sortRows(rows, columnId, dataType, sortOrder);
        }
        return rows;
    }

    private static sortRows(
        rows: IRow[], columnId: string, dataType: DataType, sortOrder: SortOrder
    ): IRow[] {
        const len = rows.length;
        for (let i = len - 1; i >= 0; i--) {
            for (let j = 1; j <= i; j++) {
                const cellA = rows[j - 1].getCell(columnId);
                const cellB = rows[j].getCell(columnId);
                const valueA = cellA.getValue().displayValue;
                const valueB = cellB.getValue().displayValue;

                const numberA = Number(valueA);
                const numberB = Number(valueB);

                let compare = 0;
                if (isNaN(numberA) || isNaN(numberB)) {
                    compare = SortUtil.compareValues(valueA, valueB, dataType);
                } else {
                    compare = numberA - numberB;
                }

                if (sortOrder === SortOrder.DOWN) {
                    compare = compare * (-1);
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
}
