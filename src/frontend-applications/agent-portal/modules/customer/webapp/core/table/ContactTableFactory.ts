/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ContactTableContentProvider } from './ContactTableContentProvider';
import { ContactProperty } from '../../../model/ContactProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { UserProperty } from '../../../../user/model/UserProperty';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { SearchCache } from '../../../../search/model/SearchCache';
import { ContactDetailsContext } from '../context/ContactDetailsContext';

export class ContactTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, short);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(
            new ContactTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);
        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, short?: boolean
    ): TableConfiguration {
        const tableColumns = this.getDefaultColumns();

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.CONTACT, null, null, tableColumns, [], false, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
            tableConfiguration.enableSelection = true;
            tableConfiguration.toggle = false;
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (!tableConfiguration.loadingOptions) {
            tableConfiguration.loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, [ContactProperty.USER]
            );
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                ContextMode.DETAILS, ContactProperty.ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.CONTACT;
        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case UserProperty.USER_LOGIN:
            case ContactProperty.FIRSTNAME:
            case ContactProperty.LASTNAME:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            case ContactProperty.EMAIL:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 175, true, true);
                break;
            case ContactProperty.PHONE:
            case ContactProperty.MOBILE:
            case ContactProperty.COUNTRY:
            case ContactProperty.CITY:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 130, true, true);
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 130, true, true, true);
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
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }

    private getDefaultColumns(short: boolean = false): IColumnConfiguration[] {
        let tableColumns = [];

        if (short) {
            tableColumns = [
                this.getDefaultColumnConfiguration(ContactProperty.FIRSTNAME),
                this.getDefaultColumnConfiguration(ContactProperty.LASTNAME),
                this.getDefaultColumnConfiguration(ContactProperty.EMAIL),
                this.getDefaultColumnConfiguration(UserProperty.USER_LOGIN),
                this.getDefaultColumnConfiguration(ContactProperty.PRIMARY_ORGANISATION_ID),
                this.getDefaultColumnConfiguration(UserProperty.IS_CUSTOMER),
                this.getDefaultColumnConfiguration(UserProperty.IS_AGENT),
                this.getDefaultColumnConfiguration(ContactProperty.CITY),
                this.getDefaultColumnConfiguration(ContactProperty.STREET),
                this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID)
            ];
        } else {
            tableColumns = [
                this.getDefaultColumnConfiguration(ContactProperty.FIRSTNAME),
                this.getDefaultColumnConfiguration(ContactProperty.LASTNAME),
                this.getDefaultColumnConfiguration(ContactProperty.EMAIL),
                this.getDefaultColumnConfiguration(UserProperty.USER_LOGIN),
                this.getDefaultColumnConfiguration(ContactProperty.PRIMARY_ORGANISATION_ID),
                this.getDefaultColumnConfiguration(UserProperty.IS_CUSTOMER),
                this.getDefaultColumnConfiguration(UserProperty.IS_AGENT),
                this.getDefaultColumnConfiguration(ContactProperty.PHONE),
                this.getDefaultColumnConfiguration(ContactProperty.COUNTRY),
                this.getDefaultColumnConfiguration(ContactProperty.CITY),
                this.getDefaultColumnConfiguration(ContactProperty.STREET),
                this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID)
            ];
        }

        return tableColumns;
    }

    public async getDefaultColumnConfigurations(searchCache: SearchCache): Promise<IColumnConfiguration[]> {
        const superColumns = await super.getDefaultColumnConfigurations(searchCache);
        const ticketColumns = this.getDefaultColumns();
        return [
            ...ticketColumns,
            ...superColumns.filter((c) => !ticketColumns.some((tc) => tc.property === c.property))
        ];
    }

}
