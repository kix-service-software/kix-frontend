/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WebformDetailsContext } from './context/WebformDetailsContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../model/configuration/TableConfiguration';
import { WebformTableContentProvider } from './WebformTableContentProvider';
import { WebformProperty } from '../../model/WebformProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../model/DataType';
import { Table } from '../../../table/model/Table';
import { ToggleOptions } from '../../../table/model/ToggleOptions';
import { TableFactory } from '../../../table/webapp/core/factory/TableFactory';

export class WebformTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.WEBFORM;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new WebformTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(WebformProperty.TITLE),
            this.getDefaultColumnConfiguration(WebformProperty.QUEUE_ID),
            this.getDefaultColumnConfiguration(WebformProperty.PRIORITY_ID),
            this.getDefaultColumnConfiguration(WebformProperty.TYPE_ID),
            this.getDefaultColumnConfiguration(WebformProperty.STATE_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.WEBFORM, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                WebformDetailsContext.CONTEXT_ID, KIXObjectType.WEBFORM,
                ContextMode.DETAILS, WebformProperty.ID
            );
        }

        tableConfiguration.toggle = true;
        tableConfiguration.toggleOptions = new ToggleOptions('webform-code-content', 'webform', [], false);

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config = super.getDefaultColumnConfiguration(property);

        if (property === WebformProperty.PRIORITY_ID) {
            config = new DefaultColumnConfiguration(null, null, null,
                property, false, true, true, false, 80, true, true, true, DataType.STRING, false
            );
        } else if (property === WebformProperty.STATE_ID) {
            config = new DefaultColumnConfiguration(
                null, null, null,
                property, true, true, true, false, 120, true, true, true, DataType.STRING, true
            );
        } else if (property === WebformProperty.TYPE_ID
            || property === WebformProperty.QUEUE_ID
            || property === KIXObjectProperty.VALID_ID
        ) {
            config = new DefaultColumnConfiguration(
                null, null, null,
                property, true, false, true, false, 150, true, true, true, DataType.STRING, true
            );
        }

        return config;
    }
}
