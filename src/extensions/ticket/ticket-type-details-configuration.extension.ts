import { IConfigurationExtension } from '../../core/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, TabWidgetSettings } from '../../core/model';
import { TicketTypeDetailsContext } from '../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-type-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('ticket-type-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['ticket-type-details-widget']))
        );

        const ticketTypesInfoWidget = new ConfiguredWidget('ticket-type-details-widget', new WidgetConfiguration(
            'ticket-type-info-widget', 'Translatable#Type Information', ['ticket-admin-type-edit'], null,
            false, true, null, false
        ));

        return new ContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            ['ticket-type-details-tab-widget'],
            [tabLane, ticketTypesInfoWidget],
            [], [],
            ['ticket-admin-type-create'],
            ['ticket-admin-type-duplication', 'ticket-admin-type-edit', 'ticket-admin-type-delete', 'print-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
