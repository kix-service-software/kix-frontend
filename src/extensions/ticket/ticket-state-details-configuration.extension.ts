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
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, TabWidgetSettings
} from '../../core/model';
import { TicketStateDetailsContext } from '../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-state-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('ticket-state-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['ticket-state-details-widget']))
        );

        const ticketStateInfoWidget = new ConfiguredWidget('ticket-state-details-widget', new WidgetConfiguration(
            'ticket-state-info-widget', 'Translatable#State Information', ['ticket-admin-state-edit'], null,
            false, true, null, false
        ));

        return new ContextConfiguration(
            TicketStateDetailsContext.CONTEXT_ID, [], [], [], [],
            ['ticket-state-details-tab-widget'],
            [tabLane, ticketStateInfoWidget],
            [], [],
            ['ticket-admin-state-create'],
            ['ticket-admin-state-duplication', 'ticket-admin-state-edit', 'ticket-admin-state-delete', 'print-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
