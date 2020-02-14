/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UserDetailsContext } from "../../context";
import { UserTableContentProvider } from "./UserTableContentProvider";
import { TableFactory } from "../../../../../../base-components/webapp/core/table/TableFactory";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { TableConfiguration } from "../../../../../../../model/configuration/TableConfiguration";
import { ITable, Table } from "../../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../../model/KIXObjectLoadingOptions";
import { UserProperty } from "../../../../../model/UserProperty";
import {
    DefaultColumnConfiguration
} from "../../../../../../../model/configuration/DefaultColumnConfiguration";
import { DataType } from "../../../../../../../model/DataType";
import { KIXObjectProperty } from "../../../../../../../model/kix/KIXObjectProperty";
import { TableHeaderHeight } from "../../../../../../../model/configuration/TableHeaderHeight";
import { TableRowHeight } from "../../../../../../../model/configuration/TableRowHeight";
import { RoutingConfiguration } from "../../../../../../../model/configuration/RoutingConfiguration";
import { ContextMode } from "../../../../../../../model/ContextMode";
import { ContactProperty } from "../../../../../../customer/model/ContactProperty";

export class UserTableFactory extends TableFactory {

    public objectType: KIXObjectType | string = KIXObjectType.USER;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

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
            new DefaultColumnConfiguration(null, null, null,
                UserProperty.USER_LOGIN, true, false, true, false, 250, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                ContactProperty.FIRSTNAME, true, false, true, false, 250, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                ContactProperty.LASTNAME, true, false, true, false, 250, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                ContactProperty.EMAIL, true, false, true, false, 200, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                ContactProperty.PHONE, true, false, true, false, 200, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                ContactProperty.MOBILE, true, false, true, false, 200, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                UserProperty.USER_LAST_LOGIN, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, KIXObjectProperty.VALID_ID, true, false, true, false, 100, true, true, true),
            new DefaultColumnConfiguration(null, null, null,
                KIXObjectProperty.CREATE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, KIXObjectProperty.CREATE_BY, true, false, true, true, 150, true, true),
            new DefaultColumnConfiguration(null, null, null,
                KIXObjectProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, KIXObjectProperty.CHANGE_BY, true, false, true, false, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.USER, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
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
}
