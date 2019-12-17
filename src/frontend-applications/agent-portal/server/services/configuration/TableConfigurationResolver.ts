/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { IConfigurationResolver } from "./IConfigurationResolver";
import { TableConfiguration } from "../../../model/configuration/TableConfiguration";
import { IColumnConfiguration } from "../../../model/configuration/IColumnConfiguration";
import { ModuleConfigurationService } from "./ModuleConfigurationService";
import { ConfigurationType } from "../../../model/configuration/ConfigurationType";
import { DefaultColumnConfiguration } from "./DefaultColumnConfiguration";
import { LoggingService } from "../../../../../server/services/LoggingService";
import { DataType } from "../../../model/DataType";

export class TableConfigurationResolver implements IConfigurationResolver<TableConfiguration> {

    private static INSTANCE: TableConfigurationResolver;

    public static getInstance(): TableConfigurationResolver {
        if (!TableConfigurationResolver.INSTANCE) {
            TableConfigurationResolver.INSTANCE = new TableConfigurationResolver();
        }
        return TableConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(token: string, tableConfig: TableConfiguration): Promise<void> {
        if (tableConfig && tableConfig.tableColumnConfigurations) {
            if (!tableConfig.tableColumns
                && tableConfig.tableColumnConfigurations
                && tableConfig.tableColumnConfigurations.length
            ) {
                tableConfig.tableColumns = [];
            }

            const columnConfigs = await ModuleConfigurationService.getInstance()
                .loadConfigurations<IColumnConfiguration>(token, tableConfig.tableColumnConfigurations);

            for (const columnConfigId of tableConfig.tableColumnConfigurations) {
                const columnConfig = columnConfigs.find((cc) => cc.id === columnConfigId);

                if (columnConfig) {
                    tableConfig.tableColumns.push(columnConfig);
                } else {
                    tableConfig.tableColumns.push(
                        new DefaultColumnConfiguration(
                            columnConfigId, 'ERROR', null, null, false, false, true, true, 80,
                            false, false, false, DataType.STRING, true, null, columnConfigId
                        )
                    );

                    LoggingService.getInstance().warning(
                        `Could not resolve table column: ${columnConfigId}, table: ${tableConfig.id}`
                    );
                }
            }
        }
    }

}
