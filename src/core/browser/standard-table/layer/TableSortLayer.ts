import { ITableSortLayer, TableRow } from "../..";
import { SortUtil, SortOrder, DataType, KIXObject } from "../../../model";
import { AbstractTableLayer } from './AbstractTableLayer';
import { LabelService } from "../../LabelService";

export class TableSortLayer extends AbstractTableLayer implements ITableSortLayer {

    private rows: Array<TableRow<KIXObject>> = [];

    private columnId: string;
    private sortOrder: SortOrder;

    public async getRows(refresh: boolean = false): Promise<TableRow[]> {
        this.rows = await this.getPreviousLayer().getRows(refresh);
        if (this.columnId && this.sortOrder) {
            const columns = await this.getColumns();
            const columnIndex = columns.findIndex((c) => c.id === this.columnId);

            if (columnIndex !== -1) {
                // FIXME: nur temporär, um DisplayValues vergleichen zu können, muss wieder weg
                const displayValues: Map<string | number, string> = new Map();
                for (let i = 0; i < this.rows.length; i++) {
                    let displayValue;
                    const value = this.rows[i].values.find((v) => v.columnId === this.columnId);
                    if (displayValues.has(value.objectValue)) {
                        displayValue = displayValues.get(value.objectValue);
                    } else {
                        displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                            this.rows[i].object, this.columnId
                        );
                        displayValues.set(value.objectValue, (displayValue ? displayValue : ''));
                    }
                    value.displayValue = displayValue;
                }

                const column = columns[columnIndex];
                this.rows.sort((a, b) => {
                    const rowValueA = a.values.find((v) => v.columnId === this.columnId);
                    const rowValueB = b.values.find((v) => v.columnId === this.columnId);
                    let valueA;
                    let valueB;

                    switch (column.dataType) {
                        case DataType.DATE:
                        case DataType.DATE_TIME:
                            valueA = rowValueA.objectValue;
                            valueB = rowValueB.objectValue;
                            break;
                        default:
                            valueA = rowValueA.displayValue;
                            valueB = rowValueB.displayValue;

                    }

                    const numberA = Number(valueA);
                    const numberB = Number(valueB);

                    if (isNaN(numberA) || isNaN(numberB)) {
                        return SortUtil.compareValues(valueA, valueB, column.dataType);
                    } else {
                        return valueA - valueB;
                    }
                });

                if (this.sortOrder === SortOrder.DOWN) {
                    this.rows = this.rows.reverse();
                }
            }
        }
        return this.rows;
    }

    public sort(columnId: string, sortOrder: SortOrder): void {
        this.columnId = columnId;
        this.sortOrder = sortOrder;
    }
}
