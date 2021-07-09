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
import { ReportDefinitionTableContentProvider } from './ReportDefinitionTableContentProvider';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { ContextMode } from '../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { EditReportDefinitionContext } from '../context/EditReportDefinitionDialogContext';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';

export class ReportDefinitionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.REPORT_DEFINITION;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting);
        const table = new Table(tableKey, tableConfiguration, contextId);

        table.setContentProvider(
            new ReportDefinitionTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.NAME),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.DATASOURCE),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.COMMENT),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.VALID_ID),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.CREATE_NEW_REPORT),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.REPORTS),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(ReportDefinitionProperty.CHANGE_BY)
        ];
        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.REPORT_DEFINITION, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                EditReportDefinitionContext.CONTEXT_ID, KIXObjectType.REPORT_DEFINITION,
                ContextMode.EDIT, ReportDefinitionProperty.ID, true, false, undefined, true
            );
        }

        tableConfiguration.objectType = KIXObjectType.REPORT_DEFINITION;
        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case ReportDefinitionProperty.NAME:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 250, true, true
                );
                break;
            case ReportDefinitionProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 200, true, true
                );
                break;
            case ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 150, true, true, true,
                    DataType.STRING, true, 'reportdefinition-outputformat-list-cell'
                );
                break;
            case ReportDefinitionProperty.CREATE_NEW_REPORT:
                config = new DefaultColumnConfiguration(null, null, null,
                    ReportDefinitionProperty.CREATE_NEW_REPORT, true, false, false, true, 150,
                    false, false, false, DataType.STRING, false, 'create-new-report-cell'
                );
                break;
            case ReportDefinitionProperty.REPORTS:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 100, true, false
                );
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 130, true, true, true
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
