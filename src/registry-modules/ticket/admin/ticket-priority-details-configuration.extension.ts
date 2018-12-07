import { IConfigurationExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '@kix/core/dist/model';
import { TicketTypeDetailsContextConfiguration, TicketTypeDetailsContext } from '@kix/core/dist/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-priority-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ticketDetailsWidget = new ConfiguredWidget('ticket-priority-details-widget', new WidgetConfiguration(
            'ticket-priority-info-widget', 'Typ Informationen', ['ticket-admin-priority-edit'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        return new TicketTypeDetailsContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID, [], [], [], [],
            [], [],
            ['ticket-priority-details-widget'], [ticketDetailsWidget],
            [], [],
            ['ticket-admin-priority-create'],
            ['ticket-admin-priority-duplication', 'ticket-admin-priority-edit', 'ticket-admin-priority-delete']
        );
    }

    public createFormDefinitions(): void {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
