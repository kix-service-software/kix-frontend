/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MacroActionTableContentProvider } from './MacroActionTableContentProvider';
import { TableFactory } from '../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { MacroActionProperty } from '../../../model/MacroActionProperty';
import { DataType } from '../../../../../model/DataType';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { Table } from '../../../../table/model/Table';
import { ToggleOptions } from '../../../../table/model/ToggleOptions';

export class MacroActionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.MACRO_ACTION;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new MacroActionTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle: boolean = true
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                MacroActionProperty.NUMBER, true, false, false, false, 200, true, false,
                false, DataType.STRING, true, null, '', false
            ),
            new DefaultColumnConfiguration(null, null, null,
                MacroActionProperty.TYPE, true, false, true, false, 300, true, true,
                true, DataType.STRING, true, null, 'Translatable#Action', false
            ),
            new DefaultColumnConfiguration(null, null, null,
                KIXObjectProperty.VALID_ID, false, true, true, false, 100, true, true,
                true, DataType.STRING, true, null, 'Translatable#Skip', false
            ),
            new DefaultColumnConfiguration(null, null, null,
                KIXObjectProperty.COMMENT, true, false, true, false, 300, true, true,
                false, DataType.STRING, true, null, 'Translatable#Comment', false
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.MACRO_ACTION, null, null, tableColumns, [], false, false, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );

        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions(
                'macro-action-details', 'macroAction', [], false,
            );
        }

        return tableConfiguration;
    }
}
