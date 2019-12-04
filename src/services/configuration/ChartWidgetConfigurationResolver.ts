/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ChartComponentConfiguration } from "../../core/model";
import { ConfigurationType, IConfiguration } from "../../core/model/configuration";
import { ModuleConfigurationService } from "./ModuleConfigurationService";
import { TicketChartWidgetConfiguration } from "../../core/browser/ticket";
import { IConfigurationResolver } from "./IConfigurationResolver";
import { ConfigItemChartWidgetConfiguration } from "../../core/browser/cmdb";

export class ChartWidgetConfigurationResolver implements IConfigurationResolver<IConfiguration> {

    private static INSTANCE: ChartWidgetConfigurationResolver;

    public static getInstance(): ChartWidgetConfigurationResolver {
        if (!ChartWidgetConfigurationResolver.INSTANCE) {
            ChartWidgetConfigurationResolver.INSTANCE = new ChartWidgetConfigurationResolver();
        }
        return ChartWidgetConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(token: string, configuration: IConfiguration): Promise<void> {
        if (configuration && configuration.subConfigurationDefinition) {
            const chartConfig = await ModuleConfigurationService.getInstance()
                .loadConfiguration<ChartComponentConfiguration>(
                    token, configuration.subConfigurationDefinition.configurationId
                );

            configuration.configuration = chartConfig;
        }
    }

}
