/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */



import { TableWidgetConfigurationResolver } from './TableWidgetConfigurationResolver';
import { TableConfigurationResolver } from './TableConfigurationResolver';
import { IConfigurationResolver } from './IConfigurationResolver';
import { ContextConfiguration } from '../../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../../model/configuration/ConfiguredWidget';
import { WidgetConfiguration } from '../../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../../model/configuration/ConfigurationType';
import { ChartWidgetConfigurationResolver } from './ChartWidgetConfigurationResolver';
import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';
import { ResolverUtil } from './ResolverUtil';

export class ContextConfigurationResolver {

    private static INSTANCE: ContextConfigurationResolver;

    public static getInstance(): ContextConfigurationResolver {
        if (!ContextConfigurationResolver.INSTANCE) {
            ContextConfigurationResolver.INSTANCE = new ContextConfigurationResolver();
        }
        return ContextConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(
        token: string, configuration: ContextConfiguration, sysConfigOptions: SysConfigOption[]
    ): Promise<ContextConfiguration> {
        // TODO: rename "explorer" to "leftSidebars" and "sidebars" to "rightSidebars" in ContextConfiguration
        // - use the following to consider/handle then "old" configurations
        // if (!configuration.rightSidebars && configuration['sidebars']) {
        //     configuration.rightSidebars = configuration['sidebars'];
        //     delete configuration['sidebars'];
        // }
        // if (!configuration.leftSidebars && configuration['explorer']) {
        //     configuration.leftSidebars = configuration['explorer'];
        //     delete configuration['explorer'];
        // }

        const configIds = [
            ...(configuration.content || []).map((c) => c.configurationId),
            ...(configuration.lanes || []).map((c) => c.configurationId),
            ...(configuration.sidebars || []).map((c) => c.configurationId),
            ...(configuration.explorer || []).map((c) => c.configurationId),
            ...(configuration.overlays || []).map((c) => c.configurationId),
            ...(configuration.others || []).map((c) => c.configurationId)
        ];

        const configurations = await ResolverUtil.loadConfigurations(token, configIds, [], sysConfigOptions);

        await this.resolveWidgetConfigurations(token, configuration.content, configurations, sysConfigOptions);
        await this.resolveWidgetConfigurations(token, configuration.lanes, configurations, sysConfigOptions);
        await this.resolveWidgetConfigurations(token, configuration.sidebars, configurations, sysConfigOptions);
        await this.resolveWidgetConfigurations(token, configuration.explorer, configurations, sysConfigOptions);
        await this.resolveWidgetConfigurations(token, configuration.overlays, configurations, sysConfigOptions);
        await this.resolveWidgetConfigurations(token, configuration.others, configurations, sysConfigOptions);

        return configuration;
    }

    private async resolveWidgetConfigurations(
        token: string, widgets: ConfiguredWidget[] = [], configurations: WidgetConfiguration[],
        sysConfigOptions: SysConfigOption[]
    ): Promise<void> {
        for (const w of widgets) {

            // get referenced config from loaded widget configs
            const config = configurations.find((wc) => wc.id === w.configurationId);
            if (config) {
                w.configuration = config;
                w.configuration.instanceId = w.instanceId;
            }
            // else let already configurated configs 8no sysconfig reference) untouched, but resolve sub configs also
            // (e.g. TableWidgetConfig: map of depricated tableConfiguration property to configuration)

            if (w.configuration) {
                await this.resolveSubConfig(token, w.configuration, sysConfigOptions);
            }
        }
    }

    private async resolveSubConfig(
        token: string, config: WidgetConfiguration, sysConfigOptions: SysConfigOption[]
    ): Promise<void> {
        const subconfig = config.subConfigurationDefinition;

        if (subconfig?.configurationId && subconfig.configurationType) {
            const option = sysConfigOptions.find((o) => o.Name === subconfig.configurationId);

            if (option && option.Value) {
                config.configuration = JSON.parse(option.Value);
            }
        }

        if (config.configuration) {
            let resolver: IConfigurationResolver;
            switch (config.configuration.type) {
                case ConfigurationType.TableWidget:
                    resolver = TableWidgetConfigurationResolver.getInstance();
                    break;
                case ConfigurationType.ChartWidget:
                    resolver = ChartWidgetConfigurationResolver.getInstance();
                    break;
                case ConfigurationType.Table:
                    resolver = TableConfigurationResolver.getInstance();
                    break;
                default:
            }

            if (resolver) {
                await resolver.resolve(token, config.configuration, sysConfigOptions);
            }
        }
    }

}
