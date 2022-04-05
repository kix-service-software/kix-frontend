/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { ImportExportTemplateRunProperty } from '../../../model/ImportExportTemplateRunProperty';
import { ImportExportTemplateRunTableContentProvider } from './ImportExportTemplateRunTableContentProvider';

export class ImportExportTemplateRunTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new ImportExportTemplateRunTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(ImportExportTemplateRunProperty.LIST_NUMBER),
            this.getDefaultColumnConfiguration(ImportExportTemplateRunProperty.STATE_ID),
            this.getDefaultColumnConfiguration(ImportExportTemplateRunProperty.START_TIME),
            this.getDefaultColumnConfiguration(ImportExportTemplateRunProperty.END_TIME),
            this.getDefaultColumnConfiguration(ImportExportTemplateRunProperty.SUCCESS_COUNT),
            this.getDefaultColumnConfiguration(ImportExportTemplateRunProperty.FAIL_COUNT)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN, null, null, tableColumns, [], false, false, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case ImportExportTemplateRunProperty.LIST_NUMBER:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 100, true, false,
                    false, DataType.NUMBER, true, null, null, false
                );
                break;
            case ImportExportTemplateRunProperty.STATE_ID:
            case ImportExportTemplateRunProperty.STATE:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 150, true, true, true
                );
                break;
            case ImportExportTemplateRunProperty.SUCCESS_COUNT:
            case ImportExportTemplateRunProperty.FAIL_COUNT:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 150, true, false,
                    false, DataType.NUMBER, true, null, null, false
                );
                break;
            case ImportExportTemplateRunProperty.START_TIME:
            case ImportExportTemplateRunProperty.END_TIME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 150, true, true,
                    false, DataType.DATE_TIME
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
