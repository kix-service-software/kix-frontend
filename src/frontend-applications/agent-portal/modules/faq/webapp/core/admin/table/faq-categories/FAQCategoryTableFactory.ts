/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQCategoryDetailsContext } from '../../context';
import { TableFactory } from '../../../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../../../table/model/Table';
import { FAQCategoryTableContentProvider } from '.';
import { FAQCategoryProperty } from '../../../../../model/FAQCategoryProperty';
import { KIXObjectProperty } from '../../../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../../../model/configuration/IColumnConfiguration';
import {
    DefaultColumnConfiguration
} from '../../../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../../../model/DataType';

export class FAQCategoryTableFactory extends TableFactory {

    public objectType: KIXObjectType | string = KIXObjectType.FAQ_CATEGORY;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(
            new FAQCategoryTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(FAQCategoryProperty.NAME),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.ID),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.FAQ_CATEGORY, null, 20, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                FAQCategoryDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_CATEGORY,
                ContextMode.DETAILS, FAQCategoryProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case FAQCategoryProperty.NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case FAQCategoryProperty.COMMENT:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 275, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            case FAQCategoryProperty.ID:
                config = super.getDefaultColumnConfiguration('ICON');
                config.property = FAQCategoryProperty.ID;
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
