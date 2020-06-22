/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRow } from './IRow';
import { SortOrder } from '../../../../../model/SortOrder';
import { DataType } from '../../../../../model/DataType';
import { SortUtil } from '../../../../../model/SortUtil';

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
                    compare = SortUtil.compareValues(valueA, valueB, DataType.STRING);
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
