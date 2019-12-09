/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from "../../core/model/configuration";
import { ModuleConfigurationService } from "./ModuleConfigurationService";
import { TableConfiguration } from "../../core/browser";
import { TableConfigurationResolver } from "./TableConfigurationResolver";
import { TableWidgetConfiguration } from "../../core/model";
import { IConfigurationResolver } from "./IConfigurationResolver";

export class TableWidgetConfigurationResolver implements IConfigurationResolver<TableWidgetConfiguration> {

    private static INSTANCE: TableWidgetConfigurationResolver;

    public static getInstance(): TableWidgetConfigurationResolver {
        if (!TableWidgetConfigurationResolver.INSTANCE) {
            TableWidgetConfigurationResolver.INSTANCE = new TableWidgetConfigurationResolver();
        }
        return TableWidgetConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(token: string, configuration: TableWidgetConfiguration): Promise<void> {
        if (configuration) {
            if (configuration.subConfigurationDefinition) {
                const tableConfig = await ModuleConfigurationService.getInstance()
                    .loadConfiguration<TableConfiguration>(
                        token, configuration.subConfigurationDefinition.configurationId
                    );

                configuration.tableConfiguration = tableConfig;
                await TableConfigurationResolver.getInstance().resolve(token, tableConfig);
            }
        }
    }

}
