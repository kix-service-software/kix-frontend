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
            'ticket-queue-info-widget', 'Translatable#Queue Information', ['ticket-admin-queue-edit'], null,
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
            ['ticket-admin-queue-edit']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
