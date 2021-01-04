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
import { TextModulesTableContentProvider } from './TextModulesTableContentProvider';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { DialogRoutingConfiguration } from '../../../../../model/configuration/DialogRoutingConfiguration';
import { ContextMode } from '../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { TextModuleProperty } from '../../../model/TextModuleProperty';

export class TextModulesTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): Table {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TextModulesTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean,
        short: boolean = false
    ): TableConfiguration {
        let tableColumns = [
            this.getDefaultColumnConfiguration(TextModuleProperty.NAME),
            this.getDefaultColumnConfiguration(TextModuleProperty.LANGUAGE),
            this.getDefaultColumnConfiguration(TextModuleProperty.KEYWORDS)
        ];
        if (!short) {
            tableColumns = [
                this.getDefaultColumnConfiguration(TextModuleProperty.NAME),
                this.getDefaultColumnConfiguration(TextModuleProperty.KEYWORDS),
                this.getDefaultColumnConfiguration(TextModuleProperty.LANGUAGE),
                this.getDefaultColumnConfiguration(TextModuleProperty.COMMENT),
                this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
                this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
                this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
                this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
                this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
            ];

        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.TEXT_MODULE, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new DialogRoutingConfiguration(
                null, KIXObjectType.TEXT_MODULE, ContextMode.EDIT_ADMIN, TextModuleProperty.ID, null, true,
                undefined, true
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case TextModuleProperty.NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case TextModuleProperty.KEYWORDS:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 250, true, true,
                    false, DataType.STRING, true, 'label-list-cell-content', null, false
                );
                break;
            case TextModuleProperty.LANGUAGE:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 200, true, true, true);
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
