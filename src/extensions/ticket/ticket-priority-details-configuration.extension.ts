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
    WidgetConfiguration, ConfiguredWidget, WidgetSize, ContextConfiguration, TabWidgetSettings
} from '../../core/model';
import { TicketPriorityDetailsContext } from '../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-priority-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('ticket-priority-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['ticket-priority-details-widget']))
        );

        const priorityDetailsWidget = new ConfiguredWidget('ticket-priority-details-widget', new WidgetConfiguration(
            'ticket-priority-info-widget', 'Translatable#Priority Information', [], null,
            false, true, null, false
        ));

        return new ContextConfiguration(
            TicketPriorityDetailsContext.CONTEXT_ID, [], [], [], [],
            ['ticket-priority-details-tab-widget'], [tabLane, priorityDetailsWidget],
            [], [],
            ['ticket-admin-priority-create'],
            [
                'ticket-admin-priority-edit', 'print-action'
            ]
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
