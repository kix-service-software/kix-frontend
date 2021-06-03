/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { MailFilterDetailsContext } from '../context';
import { TableFactory } from '../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../base-components/webapp/core/table';
import { MailFilterTableContentProvider } from './MailFilterTableContentProvider';
import { MailFilterProperty } from '../../../model/MailFilterProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';

export class MailFilterTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.MAIL_FILTER;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new MailFilterTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(MailFilterProperty.NAME),
            this.getDefaultColumnConfiguration(MailFilterProperty.STOP_AFTER_MATCH),
            this.getDefaultColumnConfiguration(MailFilterProperty.MATCH),
            this.getDefaultColumnConfiguration(MailFilterProperty.SET),
            this.getDefaultColumnConfiguration(KIXObjectProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.MAIL_FILTER, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                MailFilterDetailsContext.CONTEXT_ID, KIXObjectType.MAIL_FILTER,
                ContextMode.DETAILS, MailFilterProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case MailFilterProperty.NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case MailFilterProperty.STOP_AFTER_MATCH:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, false, true, true, false, 41, true, false,
                    false, DataType.NUMBER, false, null, null, false
                );
                break;
            case MailFilterProperty.MATCH:
            case MailFilterProperty.SET:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 300, false, false,
                    false, DataType.STRING, true, 'label-list-cell-content', null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
