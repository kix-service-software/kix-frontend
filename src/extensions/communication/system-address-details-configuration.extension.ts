/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, ContextConfiguration, TabWidgetConfiguration
} from '../../core/model';
import { SystemAddressDetailsContext } from '../../core/browser/system-address/context';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return SystemAddressDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const systemAddressInfoWidget = new WidgetConfiguration(
            'system-address-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'system-address-info-widget', 'Translatable#Email Information', [],
            null, null, false, true, null, false
        );
        configurations.push(systemAddressInfoWidget);

        const tabConfig = new TabWidgetConfiguration(
            'system-address-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['system-address-details-info-widget']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'system-address-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('system-address-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('system-address-details-tab-widget', 'system-address-details-tab-widget')
                ],
                [],
                [
                    'system-address-create'
                ],
                [
                    'system-address-edit', 'print-action'
                ],
                [],
                [
                    new ConfiguredWidget('system-address-details-info-widget', 'system-address-details-info-widget')
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
