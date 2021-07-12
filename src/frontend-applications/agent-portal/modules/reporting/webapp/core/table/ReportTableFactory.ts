/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../base-components/webapp/core/table';
import { ReportTableContentProvider } from './ReportTableContentProvider';
import { ReportProperty } from '../../../model/ReportProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';

export class ReportTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.REPORT;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting);
        const table = new Table(tableKey, tableConfiguration, contextId);

        table.setContentProvider(
            new ReportTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(ReportProperty.DEFINITION_ID),
            this.getDefaultColumnConfiguration(ReportProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(ReportProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(ReportProperty.RESULTS),
        ];
        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.REPORT, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        tableConfiguration.objectType = KIXObjectType.REPORT;
        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case ReportProperty.RESULTS:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 250, true, true, true,
                    DataType.STRING, true, 'reportresult-list-cell'
                );
                break;
            default:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true
                );
        }
        return config;
    }

}
