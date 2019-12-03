/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, TabWidgetConfiguration } from '../../core/model';
import { TicketTypeDetailsContext } from '../../core/browser/ticket';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-type-details';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const ticketTypesInfoWidget = new WidgetConfiguration(
            'ticket-type-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'ticket-type-info-widget', 'Translatable#Type Information', [], null, null,
            false, true, null, false
        );
        configurations.push(ticketTypesInfoWidget);

        const tabWidgetSettings = new TabWidgetConfiguration(
            'ticket-type-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['ticket-type-details-info-widget']
        );
        configurations.push(tabWidgetSettings);

        const tabWidget = new WidgetConfiguration(
            'ticket-type-details-tab-widget', 'Ticket Type Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ticket-type-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabWidget);

        configurations.push(
            new ContextConfiguration(
                'ticket-type-details', 'Ticket Type Details', ConfigurationType.Context,
                TicketTypeDetailsContext.CONTEXT_ID,
                [], [],
                [
                    new ConfiguredWidget('ticket-type-details-tab-widget', 'ticket-type-details-tab-widget')
                ],
                [],
                [
                    'ticket-admin-type-create'
                ],
                [
                    'ticket-admin-type-edit', 'print-action'
                ],
                [],
                [
                    new ConfiguredWidget('ticket-type-details-info-widget', 'ticket-type-details-info-widget')
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
