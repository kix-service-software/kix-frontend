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
import { OrganisationTableContentProvider } from './OrganisationTableContentProvider';
import { OrganisationProperty } from '../../../model/OrganisationProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { OrganisationDetailsContext } from '..';
import { ContextMode } from '../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';

export class OrganisationTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting);
        const table = new Table(tableKey, tableConfiguration, contextId);

        table.setContentProvider(
            new OrganisationTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(OrganisationProperty.NUMBER),
            this.getDefaultColumnConfiguration(OrganisationProperty.NAME),
            this.getDefaultColumnConfiguration(OrganisationProperty.COUNTRY),
            this.getDefaultColumnConfiguration(OrganisationProperty.CITY),
            this.getDefaultColumnConfiguration(OrganisationProperty.STREET),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID)
        ];
        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.ORGANISATION, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION,
                ContextMode.DETAILS, OrganisationProperty.ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.ORGANISATION;
        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case OrganisationProperty.NUMBER:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 230, true, true
                );
                break;
            case OrganisationProperty.NAME:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 350, true, true
                );
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true, true
                );
                break;
            default:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true
                );
        }
        return config;
    }

}
