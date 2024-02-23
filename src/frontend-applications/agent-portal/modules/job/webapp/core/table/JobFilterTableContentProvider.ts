/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { JobFilterTableProperty } from './JobFilterTableProperty';
import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Job } from '../../../model/Job';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { SearchOperatorUtil } from '../../../../search/webapp/core';
import { JobFilterTableContentProviderService } from './JobFilterTableContentProviderService';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class JobFilterTableContentProvider extends TableContentProvider<any> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.JOB, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<RowObject[]> {
        const rowObjects: RowObject[] = [];

        const context = ContextService.getInstance().getActiveContext();
        const job = context ? await context.getObject<Job>() : null;

        const filterList = Array.isArray(job?.Filter) && Array.isArray(this.objectIds) ?
            job.Filter[this.objectIds[0]] : null;
        if (filterList && typeof filterList === 'object') {
            for (const filter in filterList) {
                if (filter && Array.isArray(filterList[filter])) {
                    const criteria = filterList[filter];
                    for (const criterion of criteria) {
                        let displayKey: string = criterion.Field;
                        let displayValues: any;
                        let displayIcons: Array<string | ObjectIcon> = [];
                        let displayString = '';

                        const preparedValues = await JobFilterTableContentProviderService.getInstance().getValues(
                            displayKey, criterion, job, criteria
                        );
                        if (Array.isArray(preparedValues)) {
                            displayKey = preparedValues[0];
                            displayValues = preparedValues[1];
                            displayIcons = preparedValues[2];
                            displayString = preparedValues[3];
                        }

                        const operatorLabel = await SearchOperatorUtil.getText(criterion.Operator);
                        const allStrings = Array.isArray(displayValues) &&
                            displayValues.every((dv) => typeof dv === 'string');

                        const values: TableValue[] = [
                            new TableValue(JobFilterTableProperty.FIELD, criterion.Field, displayKey),
                            new TableValue(JobFilterTableProperty.OPERATOR, criterion.Operator, operatorLabel),
                            new TableValue(
                                JobFilterTableProperty.VALUE, displayValues,
                                displayString, null, displayIcons, undefined,
                                allStrings ? displayValues : undefined
                            )
                        ];
                        rowObjects.push(new RowObject<any>(values));
                    }
                }

            }
        }
        return rowObjects;
    }
}
