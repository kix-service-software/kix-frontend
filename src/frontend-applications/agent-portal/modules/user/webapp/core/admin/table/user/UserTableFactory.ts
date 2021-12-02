/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UserTableContentProvider } from './UserTableContentProvider';
import { TableFactory } from '../../../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { UserProperty } from '../../../../../model/UserProperty';
import { DefaultColumnConfiguration } from '../../../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../../../model/DataType';
import { KIXObjectProperty } from '../../../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../../../model/ContextMode';
import { ContactProperty } from '../../../../../../customer/model/ContactProperty';
import { IColumnConfiguration } from '../../../../../../../model/configuration/IColumnConfiguration';
import { UserDetailsContext } from '../../context/user';

export class UserTableFactory extends TableFactory {

    public objectType: KIXObjectType | string = KIXObjectType.USER;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(
            new UserTableContentProvider(
                table, objectIds, tableConfiguration.loadingOptions, contextId
            )
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(UserProperty.USER_LOGIN),
            this.getDefaultColumnConfiguration(ContactProperty.FIRSTNAME),
            this.getDefaultColumnConfiguration(ContactProperty.LASTNAME),
            this.getDefaultColumnConfiguration(UserProperty.IS_CUSTOMER),
            this.getDefaultColumnConfiguration(UserProperty.IS_AGENT),
            this.getDefaultColumnConfiguration(ContactProperty.PHONE),
            this.getDefaultColumnConfiguration(ContactProperty.MOBILE),
            this.getDefaultColumnConfiguration(ContactProperty.EMAIL),
            this.getDefaultColumnConfiguration(UserProperty.USER_LAST_LOGIN),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.USER, new KIXObjectLoadingOptions(null, null, null, [UserProperty.PREFERENCES]),
                17, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!Array.isArray(tableConfiguration.tableColumns) || !tableConfiguration.tableColumns.length) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (!tableConfiguration.loadingOptions) {
            tableConfiguration.loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, [UserProperty.PREFERENCES, UserProperty.CONTACT]
            );
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                UserDetailsContext.CONTEXT_ID, KIXObjectType.USER,
                ContextMode.DETAILS, UserProperty.USER_ID
            );
        }

        return tableConfiguration;
    }
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case UserProperty.USER_LOGIN:
            case ContactProperty.FIRSTNAME:
            case ContactProperty.LASTNAME:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 250, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            case ContactProperty.EMAIL:
            case ContactProperty.PHONE:
            case ContactProperty.MOBILE:
            case ContactProperty.COUNTRY:
            case ContactProperty.CITY:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 200, true, true);
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 100, true, true, true);
                break;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 150, true, true, false, DataType.STRING, true, null,
                    'Translatable#Organisation'
                );
                break;
            case UserProperty.IS_AGENT:
            case UserProperty.IS_CUSTOMER:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, false, true, true, false, undefined, true, true, true, undefined
                );
                break;
            case UserProperty.USER_LAST_LOGIN:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
