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
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TabWidgetSettings
} from '../../core/model';
import { QueueDetailsContext } from '../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-queue-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('ticket-queue-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['ticket-queue-details-widget']))
        );

        const ticketQueueInfoWidget = new ConfiguredWidget('ticket-queue-details-widget', new WidgetConfiguration(
            'ticket-queue-info-widget', 'Translatable#Queue Information', [], null,
            false, true, WidgetSize.BOTH, false
        ));

        const signatureWidget = new ConfiguredWidget('ticket-queue-signature', new WidgetConfiguration(
            'ticket-queue-signature', 'Translatable#Signature', [], null, true, true, WidgetSize.BOTH, false
        ));

        return new ContextConfiguration(
            QueueDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            ['ticket-queue-details-tab-widget', 'ticket-queue-signature'],
            [tabLane, signatureWidget, ticketQueueInfoWidget],
            [], [],
            ['ticket-admin-queue-create'],
            ['ticket-admin-queue-edit', 'print-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
