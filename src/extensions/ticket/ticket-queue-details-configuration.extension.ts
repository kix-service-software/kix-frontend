import { IConfigurationExtension } from '../../core/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '../../core/model';
import { QueueDetailsContext } from '../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-queue-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ticketQueueDetailsWidget = new ConfiguredWidget('ticket-queue-details-widget', new WidgetConfiguration(
            'ticket-queue-info-widget', 'Translatable#Queue Information', ['ticket-admin-queue-edit'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const signatureWidget = new ConfiguredWidget('ticket-queue-signature', new WidgetConfiguration(
            'ticket-queue-signature', 'Translatable#Signature', [], null, true, true, WidgetSize.BOTH, null, false
        ));

        return new ContextConfiguration(
            QueueDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            ['ticket-queue-signature'], [signatureWidget],
            ['ticket-queue-details-widget'], [ticketQueueDetailsWidget],
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
