/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration, TableWidgetConfiguration, DataType } from "../../core/model";
import { ConfigurationType } from "../../core/model/configuration";
import { ModuleConfigurationService } from "./ModuleConfigurationService";
import { TableConfiguration, IColumnConfiguration, DefaultColumnConfiguration } from "../../core/browser";
import { LoggingService } from "../../core/services";
import { IConfigurationResolver } from "./IConfigurationResolver";

export class TableConfigurationResolver implements IConfigurationResolver<TableConfiguration> {

    private static INSTANCE: TableConfigurationResolver;

    public static getInstance(): TableConfigurationResolver {
        if (!TableConfigurationResolver.INSTANCE) {
            TableConfigurationResolver.INSTANCE = new TableConfigurationResolver();
        }
        return TableConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(tableConfig: TableConfiguration): Promise<void> {
        if (tableConfig && tableConfig.tableColumnConfigurations) {
            if (!tableConfig.tableColumns
                && tableConfig.tableColumnConfigurations
                && tableConfig.tableColumnConfigurations.length
            ) {
                tableConfig.tableColumns = [];
            }

            for (const columnConfigId of tableConfig.tableColumnConfigurations) {
                const columnConfig = await ModuleConfigurationService.getInstance()
                    .loadConfiguration<IColumnConfiguration>(ConfigurationType.TableColumn, columnConfigId);

                if (columnConfig) {
                    tableConfig.tableColumns.push(columnConfig);
                } else {
                    tableConfig.tableColumns.push(
                        new DefaultColumnConfiguration(
                            // tslint:disable-next-line:max-line-length
                            columnConfigId, 'ERROR', null, null, false, false, true, true, 80, false, false, false, DataType.STRING, true, null, columnConfigId
                        )
                    );

                    LoggingService.getInstance().warning(
                        // tslint:disable-next-line:max-line-length
                        `Could not resolve table column: ${columnConfigId}, table: ${tableConfig.id}`
                    );
                }
            }
        }
    }

}
