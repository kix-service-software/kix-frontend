/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { TicketPriorityDetailsContext } from './webapp/core';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-priority-details';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const priorityInfoWidget = new WidgetConfiguration(
            'ticket-priority-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'ticket-priority-info-widget', 'Translatable#Priority Information', [],
            null, null, false, true, null, false
        );
        configurations.push(priorityInfoWidget);

        const tabWidgetSettings = new TabWidgetConfiguration(
            'ticket-priority-details-tab-widget-config', 'Priority Details Tab Config', ConfigurationType.TabWidget,
            ['ticket-priority-details-info-widget']
        );
        configurations.push(tabWidgetSettings);

        const tabWidgetConfig = new WidgetConfiguration(
            'ticket-priority-details-tab-widget', 'Priority Details Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ticket-priority-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabWidgetConfig);

        configurations.push(
            new ContextConfiguration(
                'ticket-priority-details', 'Ticket Priority Details', ConfigurationType.Context,
                TicketPriorityDetailsContext.CONTEXT_ID,
                [], [],
                [
                    new ConfiguredWidget('ticket-priority-details-tab-widget', 'ticket-priority-details-tab-widget')
                ],
                [],
                [
                    'ticket-admin-priority-create'
                ],
                [
                    'ticket-admin-priority-edit'
                ],
                [],
                [
                    new ConfiguredWidget('ticket-priority-details-info-widget', 'ticket-priority-details-info-widget')
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
