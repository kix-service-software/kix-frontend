/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../../base-components/webapp/core/table/TableContentProvider';
import { TranslationPattern } from '../../../../../model/TranslationPattern';
import { ITable, IRowObject, TableValue, RowObject } from '../../../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationPatternProperty } from '../../../../../model/TranslationPatternProperty';

export class TranslationPatternTableContentProvider extends TableContentProvider<TranslationPattern> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION_PATTERN, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<TranslationPattern>>> {
        let objects = [];
        if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
            objects = await KIXObjectService.loadObjects<TranslationPattern>(
                this.objectType, this.objectIds, this.loadingOptions, null, false
            );
        }

        const rowObjects = [];
        for (const t of objects) {
            const values: TableValue[] = [];

            const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
            for (const column of columns) {
                if (column.property === TranslationPatternProperty.VALUE) {
                    const tableValue = await this.getTableValue(t, column.property, column);
                    values.push(tableValue);
                } else {
                    values.push(new TableValue(column.property, t[column.property], t[column.property]));
                }
            }

            rowObjects.push(new RowObject<TranslationPattern>(values, t));
        }

        return rowObjects;
    }

}
