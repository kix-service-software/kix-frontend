/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../../table/webapp/core/TableContentProvider';
import { TranslationPattern } from '../../../../../model/TranslationPattern';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationPatternProperty } from '../../../../../model/TranslationPatternProperty';
import { RowObject } from '../../../../../../table/model/RowObject';
import { Table } from '../../../../../../table/model/Table';
import { TableValue } from '../../../../../../table/model/TableValue';

export class TranslationPatternTableContentProvider extends TableContentProvider<TranslationPattern> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION_PATTERN, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<TranslationPattern>>> {
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
                    const tableValue = new TableValue(column.property, t[column.property]);
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
