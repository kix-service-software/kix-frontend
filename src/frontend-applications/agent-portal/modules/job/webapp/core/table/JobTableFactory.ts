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
import { Table } from '../../../../table/model/Table';
import { JobTableContentProvider } from '.';
import { JobProperty } from '../../../model/JobProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { JobDetailsContext } from '..';
import { ContextMode } from '../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';

export class JobTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new JobTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(JobProperty.TYPE),
            this.getDefaultColumnConfiguration(JobProperty.NAME),
            this.getDefaultColumnConfiguration(JobProperty.HAS_TRIGGER_EVENTS),
            this.getDefaultColumnConfiguration(JobProperty.HAS_TRIGGER_TIMES),
            this.getDefaultColumnConfiguration(JobProperty.ACTION_COUNT),
            this.getDefaultColumnConfiguration(JobProperty.LAST_EXEC_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                null, null, null,
                KIXObjectType.JOB,
                new KIXObjectLoadingOptions(
                    undefined, undefined, undefined, [JobProperty.MACROS, JobProperty.EXEC_PLANS]
                ),
                20, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else {
            if (!tableConfiguration.tableColumns) {
                tableConfiguration.tableColumns = tableColumns;
            }
            if (!tableConfiguration.loadingOptions) {
                tableConfiguration.loadingOptions = new KIXObjectLoadingOptions(
                    undefined, undefined, undefined, [JobProperty.MACROS, JobProperty.EXEC_PLANS]
                );
            }
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                JobDetailsContext.CONTEXT_ID, KIXObjectType.JOB,
                ContextMode.DETAILS, JobProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case JobProperty.HAS_TRIGGER_EVENTS:
            case JobProperty.HAS_TRIGGER_TIMES:
                config = new DefaultColumnConfiguration(
                    null, null, null,
                    property, false, true, true, false, 110, true, true, true,
                    DataType.STRING, true, null, null, false
                );
                break;
            case JobProperty.ACTION_COUNT:
            case JobProperty.LAST_EXEC_TIME:
                config = new DefaultColumnConfiguration(
                    null, null, null,
                    property, true, false, true, false, 150, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            case JobProperty.NAME:
                config = super.getDefaultColumnConfiguration(property, false);
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }

}
