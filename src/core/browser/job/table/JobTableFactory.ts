/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from "../../table/TableFactory";
import { KIXObjectType, JobProperty, KIXObjectProperty, DataType, KIXObjectLoadingOptions } from "../../../model";
import {
    TableConfiguration, ITable, Table, TableHeaderHeight, TableRowHeight,
    DefaultColumnConfiguration, IColumnConfiguration
} from "../../table";
import { JobTableContentProvider } from "./JobTableContentProvider";

export class JobTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

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
            this.getDefaultColumnConfiguration(JobProperty.NAME),
            this.getDefaultColumnConfiguration(JobProperty.TRIGGER_EVENTS),
            this.getDefaultColumnConfiguration(JobProperty.TRIGGER_TIME),
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
                KIXObjectType.JOB,
                new KIXObjectLoadingOptions(
                    undefined, undefined, undefined, [JobProperty.MACROS, JobProperty.EXEC_PLANS]
                ),
                null, tableColumns, true, false, null, null,
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
            // tableConfiguration.routingConfiguration = new RoutingConfiguration(
            //     NotificationDetailsContext.CONTEXT_ID, KIXObjectType.NOTIFICATION,
            //     ContextMode.DETAILS, NotificationProperty.ID
            // );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case JobProperty.TRIGGER_EVENTS:
            case JobProperty.TRIGGER_TIME:
                config = new DefaultColumnConfiguration(
                    property, false, true, true, false, 110, true, true, true,
                    DataType.STRING, true, null, null, false
                );
                break;
            case JobProperty.ACTION_COUNT:
            case JobProperty.LAST_EXEC_TIME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }

}
