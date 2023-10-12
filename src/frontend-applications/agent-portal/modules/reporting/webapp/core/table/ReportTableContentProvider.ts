/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { Report } from '../../../model/Report';
import { Table } from '../../../../table/model/Table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ReportProperty } from '../../../model/ReportProperty';
import { TableValue } from '../../../../table/model/TableValue';
import { RowObject } from '../../../../table/model/RowObject';
import { ValueState } from '../../../../table/model/ValueState';
import { SortUtil } from '../../../../../model/SortUtil';

export class ReportTableContentProvider extends TableContentProvider<Report> {

    public constructor(
        table: Table,
        objectIds: string[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.REPORT, table, objectIds, loadingOptions, contextId);
    }

    public async getRowObjects(objects: Report[]): Promise<RowObject[]> {
        const rowObjects = await super.getRowObjects(objects);

        for (const rowObject of rowObjects) {
            const hasRow = rowObjects.some(
                (ro) => ro.getObject()?.DefinitionID === rowObject.getObject()?.DefinitionID
                    && SortUtil.compareDate(ro.getObject()?.CreateTime, rowObject.getObject()?.CreateTime) > 0
            );

            if (hasRow) {
                rowObject.setValueState(null);
            } else {
                rowObject.setValueState(ValueState.HIGHLIGHT_SUCCESS);
            }
        }

        return rowObjects;
    }

    protected async prepareSpecificValues(values: TableValue[], report: Report): Promise<void> {
        const parameterValue = values.find((v) => v.property === ReportProperty.PARAMETER);
        if (parameterValue) {
            const parameters = report?.Config?.Parameters || [];
            const value: string[] = [];
            for (const p in parameters) {
                if (parameters[p]) {
                    value.push(`${p} - ${parameters[p]}`);
                }
            }
            parameterValue.objectValue = value.join(',');
            parameterValue.displayValue = value.join(',');
        }
    }
}
