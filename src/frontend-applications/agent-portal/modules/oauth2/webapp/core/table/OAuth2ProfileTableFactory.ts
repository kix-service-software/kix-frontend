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
import { OAuth2ProfileTableContentProvider } from './OAuth2ProfileTableContentProvider';
import { OAuth2ProfileProperty } from '../../../model/OAuth2ProfileProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { EditOAuth2ProfileDialogContext } from '../context';

export class OAuth2ProfileTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.OAUTH2_PROFILE;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new OAuth2ProfileTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(OAuth2ProfileProperty.NAME),
            this.getDefaultColumnConfiguration(OAuth2ProfileProperty.CLIENT_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY),
            this.getDefaultColumnConfiguration(OAuth2ProfileProperty.HAS_ACCESS_TOKEN),
            this.getDefaultColumnConfiguration(OAuth2ProfileProperty.RENEW_AUTH)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.OAUTH2_PROFILE, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                EditOAuth2ProfileDialogContext.CONTEXT_ID, null, null, OAuth2ProfileProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case OAuth2ProfileProperty.NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case OAuth2ProfileProperty.HAS_ACCESS_TOKEN:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, false, true, false, false, 50, true, true, true, DataType.NUMBER
                );
                break;
            case OAuth2ProfileProperty.RENEW_AUTH:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, false, true, true, false, 150,
                    false, false, false, DataType.STRING, true, 'renew-authorization-cell'
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
