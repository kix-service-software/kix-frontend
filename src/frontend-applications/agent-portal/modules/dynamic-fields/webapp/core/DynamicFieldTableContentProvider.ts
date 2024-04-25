/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicField } from '../../model/DynamicField';
import { TableContentProvider } from '../../../table/webapp/core/TableContentProvider';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Table } from '../../../table/model/Table';
import { RowObject } from '../../../table/model/RowObject';
import { ValueState } from '../../../table/model/ValueState';

export class DynamicFieldTableContentProvider extends TableContentProvider<DynamicField> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.DYNAMIC_FIELD, table, objectIds, loadingOptions, contextId);
    }

    public async getRowObjects(objects: DynamicField[]): Promise<RowObject<DynamicField>[]> {
        const rowObjects = await super.getRowObjects(objects);

        for (const rowObject of rowObjects) {
            const df = rowObject.getObject() as DynamicField;
            if (df.InternalField) {
                rowObject.setValueState(ValueState.CHANGED);
            }
        }

        return rowObjects;
    }

}
