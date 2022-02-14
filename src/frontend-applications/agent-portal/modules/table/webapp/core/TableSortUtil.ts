/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DataType } from '../../../../model/DataType';
import { SortOrder } from '../../../../model/SortOrder';
import { SortUtil } from '../../../../model/SortUtil';
import { Row } from '../../model/Row';

export class TableSortUtil {

    public static async sort(
        rows: Row[], columnId: string, sortOrder: SortOrder, dataType: DataType
    ): Promise<Row[]> {
        if (columnId && sortOrder && dataType) {

            const useObjectValue =
                dataType === DataType.DATE_TIME || dataType === DataType.DATE || dataType === DataType.NUMBER;

            if (!useObjectValue) {
                const valuePromises = [];
                rows.forEach((r) => valuePromises.push(r.getCell(columnId).getDisplayValue()));

                await Promise.all(valuePromises);
            }

            rows.sort((a, b) => {
                const cellA = a.getCell(columnId);
                const cellB = b.getCell(columnId);

                const valueA = useObjectValue ? cellA.getValue().objectValue : cellA.getValue().displayValue;
                const valueB = useObjectValue ? cellB.getValue().objectValue : cellB.getValue().displayValue;

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
        }
        return rows;
    }
}
