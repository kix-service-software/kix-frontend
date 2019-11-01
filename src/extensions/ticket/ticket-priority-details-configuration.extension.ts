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
import { TicketPriorityDetailsContext } from '../../core/browser/ticket';
import { ConfigurationService } from '../../core/services';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-priority-details';
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const priorityInfoWidget = new WidgetConfiguration(
            'ticket-priority-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'ticket-priority-info-widget', 'Translatable#Priority Information', [],
            null, null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(priorityInfoWidget);

        const tabWidgetSettings = new TabWidgetConfiguration(
            'ticket-priority-details-tab-widget-config', 'Priority Details Tab Config', ConfigurationType.TabWidget,
            ['ticket-priority-details-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabWidgetSettings);

        const tabWidgetConfig = new WidgetConfiguration(
            'ticket-priority-details-tab-widget', 'Priority Details Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ticket-priority-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabWidgetConfig);

        return new ContextConfiguration(
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
                'ticket-admin-priority-edit', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('ticket-priority-details-info-widget', 'ticket-priority-details-info-widget')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
