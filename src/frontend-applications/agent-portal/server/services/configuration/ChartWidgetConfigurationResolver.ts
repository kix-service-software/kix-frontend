/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */



import { IConfigurationResolver } from './IConfigurationResolver';
import { IConfiguration } from '../../../model/configuration/IConfiguration';


import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';

export class ChartWidgetConfigurationResolver implements IConfigurationResolver<IConfiguration> {

    private static INSTANCE: ChartWidgetConfigurationResolver;

    public static getInstance(): ChartWidgetConfigurationResolver {
        if (!ChartWidgetConfigurationResolver.INSTANCE) {
            ChartWidgetConfigurationResolver.INSTANCE = new ChartWidgetConfigurationResolver();
        }
        return ChartWidgetConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(
        token: string, configuration: IConfiguration, sysConfigOptions: SysConfigOption[]
    ): Promise<void> {
        if (configuration && configuration.subConfigurationDefinition) {
            const option = sysConfigOptions.find(
                (o) => o.Name === configuration.subConfigurationDefinition.configurationId
            );
            if (option && option.Value) {
                const chartConfig = JSON.parse(option.Value);

                configuration.configuration = chartConfig;
            }
        }
    }

}
