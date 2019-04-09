import { IConfigurationExtension } from '../../../core/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '../../../core/model';
import { TicketTypeDetailsContextConfiguration, TicketTypeDetailsContext } from '../../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-type-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ticketTypesDetailsWidget = new ConfiguredWidget('ticket-type-details-widget', new WidgetConfiguration(
            'ticket-type-info-widget', 'Type Information', ['ticket-admin-type-edit'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const textmodulesWidget = new ConfiguredWidget('ticket-type-assigned-textmodules', new WidgetConfiguration(
            'ticket-type-assigned-textmodules', 'Assign Text Modules',
            ['ticket-admin-type-textmodules-edit'], null, true, true, WidgetSize.BOTH, null, false
        ));

        return new TicketTypeDetailsContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID, [], [], [], [],
            ['ticket-type-assigned-textmodules'], [textmodulesWidget],
            ['ticket-type-details-widget'], [ticketTypesDetailsWidget],
            [], [],
            ['ticket-admin-type-create'],
            ['ticket-admin-type-duplication', 'ticket-admin-type-edit', 'ticket-admin-type-delete']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
