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
        const table = new Table(tableKey, tableConfiguration);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, tableConfiguration.filter, tableConfiguration.sortOrder,
            tableConfiguration.limit, [OrganisationProperty.TICKET_STATS]
        );

        table.setContentProvider(new OrganisationTableContentProvider(table, objectIds, loadingOptions, contextId));
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
                KIXObjectType.ORGANISATION, 1000, null, tableColumns, null, false, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
            tableConfiguration.enableSelection = true;
            tableConfiguration.toggle = false;
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
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true);
        }
        return config;
    }

}
