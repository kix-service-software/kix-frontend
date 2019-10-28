/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, ContextMode, OrganisationProperty, KIXObjectLoadingOptions, KIXObjectProperty
} from "../../../model";
import { RoutingConfiguration } from "../../router";
import {
    ITable, TableConfiguration, Table, TableHeaderHeight,
    TableRowHeight, IColumnConfiguration, DefaultColumnConfiguration
} from "../../table";
import { OrganisationTableContentProvider } from "./OrganisationTableContentProvider";
import { TableFactory } from "../../table/TableFactory";
import { OrganisationDetailsContext } from "../context";

export class OrganisationTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

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
            tableConfiguration = new TableConfiguration(
                KIXObjectType.ORGANISATION, null, null, tableColumns, true, false, null, null,
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
                config = new DefaultColumnConfiguration(property, true, false, true, false, 230, true, true);
                break;
            case OrganisationProperty.NAME:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 350, true, true);
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true, true);
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }

}
