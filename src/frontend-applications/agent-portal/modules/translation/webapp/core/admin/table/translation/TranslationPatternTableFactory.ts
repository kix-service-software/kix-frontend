/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../../../table/model/Table';
import { TranslationPatternTableContentProvider } from '.';
import { TranslationPatternProperty } from '../../../../../model/TranslationPatternProperty';
import { TableHeaderHeight } from '../../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../../model/configuration/TableRowHeight';
import { IColumnConfiguration } from '../../../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../../../model/DataType';
import { KIXObjectProperty } from '../../../../../../../model/kix/KIXObjectProperty';
import { RoutingConfiguration } from '../../../../../../../model/configuration/RoutingConfiguration';
import { EditTranslationDialogContext } from '../../context';
import { ContextMode } from '../../../../../../../model/ContextMode';


export class TranslationPatternTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {
        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TranslationPatternTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(TranslationPatternProperty.VALUE),
            this.getDefaultColumnConfiguration(TranslationPatternProperty.AVAILABLE_LANGUAGES),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.TRANSLATION_PATTERN,
                null, 17, tableColumns, [], true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE,
                'Translatable#Please enter a search term.'
            );

            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                EditTranslationDialogContext.CONTEXT_ID, KIXObjectType.TRANSLATION_PATTERN,
                ContextMode.EDIT_ADMIN, TranslationPatternProperty.ID
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case TranslationPatternProperty.VALUE:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 400, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            case TranslationPatternProperty.AVAILABLE_LANGUAGES:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 250, true, true, true,
                    DataType.STRING, true, 'label-list-cell-content'
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
