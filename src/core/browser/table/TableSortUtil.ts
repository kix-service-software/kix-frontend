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
                if (dataType === DataType.DATE || dataType === DataType.DATE_TIME) {
                    compare = SortUtil.compareValues(
                        cellA.getValue().objectValue, cellB.getValue().objectValue, dataType
                    );
                } else if (isNaN(numberA) || isNaN(numberB)) {
                    compare = SortUtil.compareValues(valueA, valueB, dataType);
                } else {
                    compare = numberA - numberB;
                }

                if (sortOrder === SortOrder.DOWN) {
                    compare = compare * (-1);
                }

                return compare;
            });
        }
        return rows;
    }
}
