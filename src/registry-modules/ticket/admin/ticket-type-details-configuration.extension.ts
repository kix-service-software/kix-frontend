import { IConfigurationExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '@kix/core/dist/model';
import { TicketTypeDetailsContextConfiguration, TicketTypeDetailsContext } from '@kix/core/dist/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-type-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ticketDetailsWidget = new ConfiguredWidget('ticket-type-details-widget', new WidgetConfiguration(
            'ticket-type-info-widget', 'Typ Informationen', ['ticket-admin-type-edit'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const textmodulesWidget = new ConfiguredWidget('ticket-type-assigned-textmodules', new WidgetConfiguration(
            'ticket-type-assigned-textmodules', 'Zuordnung zu Textbausteinen', ['ticket-admin-type-edit'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        return new TicketTypeDetailsContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID, [], [], [], [],
            ['ticket-type-assigned-textmodules'], [textmodulesWidget],
            ['ticket-type-details-widget'], [ticketDetailsWidget],
            [], [],
            ['ticket-admin-type-create'],
            ['ticket-admin-type-duplication', 'ticket-admin-type-edit', 'ticket-admin-type-delete']
        );
    }

    public createFormDefinitions(): void {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
