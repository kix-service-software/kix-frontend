/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../table/model/Table';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { JobRunLogContentProvider } from './JobRunLogContentProvider';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { JobRunLog } from '../../../model/JobRunLog';
import { JobRunLogProperty } from '../../../model/JobRunLogProperty';

export class JobRunLogTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.JOB_RUN_LOG;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, sshort?: boolean,
        objectType?: KIXObjectType, objects?: KIXObject[]
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new JobRunLogContentProvider(objects as JobRunLog[], table));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(tableConfiguration: TableConfiguration): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                null, null, null, JobRunLogProperty.NUMBER, true, false, true, false, undefined, true, false, false,
                DataType.INTEGER
            ),
            new DefaultColumnConfiguration(
                null, null, null, JobRunLogProperty.OBJECT_ID, true, false, true, false, undefined, true, true, true,
                DataType.INTEGER
            ),
            new DefaultColumnConfiguration(
                null, null, null, JobRunLogProperty.PRIORITY, true, false, true, false, 150, true, true, true
            ),
            new DefaultColumnConfiguration(
                null, null, null, JobRunLogProperty.MESSAGE, true, false, true, false, 600, true, true
            ),
            new DefaultColumnConfiguration(null, null, null, KIXObjectProperty.CREATE_TIME, true, false,
                true, false, 150, true, true, false, DataType.DATE_TIME
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.JOB_RUN_LOG, null, null, tableColumns, [], null, null, null, null,
                TableHeaderHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

}
