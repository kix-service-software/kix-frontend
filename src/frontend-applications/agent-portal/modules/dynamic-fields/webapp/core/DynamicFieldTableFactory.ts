/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Table, TableHeaderHeight, TableRowHeight
} from '../../../base-components/webapp/core/table';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactory } from '../../../base-components/webapp/core/table/TableFactory';
import { DynamicFieldProperty } from '../../model/DynamicFieldProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { IColumnConfiguration } from '../../../../model/configuration/IColumnConfiguration';
import { DynamicFieldTableContentProvider } from './DynamicFieldTableContentProvider';
import { ContextMode } from '../../../../model/ContextMode';
import { TableConfiguration } from '../../../../model/configuration/TableConfiguration';
import { DefaultColumnConfiguration } from '../../../../model/configuration/DefaultColumnConfiguration';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { EditDynamicFieldDialogContext } from './EditDynamicFieldDialogContext';

export class DynamicFieldTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new DynamicFieldTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(DynamicFieldProperty.NAME, false),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.LABEL, false),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.FIELD_TYPE, false),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.OBJECT_TYPE, false),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.INTERNAL_FIELD, false),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.CUSTOMER_VISIBLE, false),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.DYNAMIC_FIELD, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                EditDynamicFieldDialogContext.CONTEXT_ID, null, null, DynamicFieldProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string, translatable: boolean = true): IColumnConfiguration {
        let config;
        switch (property) {
            case DynamicFieldProperty.FIELD_TYPE:
            case DynamicFieldProperty.OBJECT_TYPE:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true, true);
                break;
            case DynamicFieldProperty.INTERNAL_FIELD:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 100, true, true, true);
                break;
            case DynamicFieldProperty.CUSTOMER_VISIBLE:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, false, true, false, true, 100, true, true, true);
                break;
            default:
                config = super.getDefaultColumnConfiguration(property, translatable);
        }
        return config;
    }
}
