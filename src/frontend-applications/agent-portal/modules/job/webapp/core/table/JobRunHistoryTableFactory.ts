/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { JobRunHistoryContentProvider } from './JobRunHistoryContentProvider';
import { JobRunProperty } from '../../../model/JobRunProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { Table } from '../../../../table/model/Table';
import { ToggleOptions } from '../../../../table/model/ToggleOptions';

export class JobRunHistoryTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.JOB_RUN;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new JobRunHistoryContentProvider(table, null, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle: boolean = true
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                null, null, null, JobRunProperty.STATE, true, false, true, false, 200, true, true, true
            ),
            new DefaultColumnConfiguration(
                null, null, null, KIXObjectProperty.CREATE_BY, true, false, true, true, 200, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null, JobRunProperty.START_TIME, true, false, true, false, 150,
                true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(null, null, null, JobRunProperty.END_TIME, true, false, true, false, 150,
                true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, JobRunProperty.LOGS, false, true, true, false, undefined,
                false, false, false, DataType.STRING, false, 'job-run-log-download-cell', 'Translatable#Download log'
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.JOB_RUN, null, null, tableColumns, [], null, null, null, null,
                TableHeaderHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('job-run-logs', 'jobRun', [], false);
        }

        return tableConfiguration;
    }

}
