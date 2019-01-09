import { IConfigurationExtension } from '../../../core/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '../../../core/model';
import { TicketPriorityDetailsContext, TicketPriorityDetailsContextConfiguration } from '../../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-priority-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const priorityDetailsWidget = new ConfiguredWidget('ticket-priority-details-widget', new WidgetConfiguration(
            'ticket-priority-info-widget', 'Priorität Informationen', ['ticket-admin-priority-edit'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        return new TicketPriorityDetailsContextConfiguration(
            TicketPriorityDetailsContext.CONTEXT_ID, [], [], [], [],
            [], [],
            ['ticket-priority-details-widget'], [priorityDetailsWidget],
            [], [],
            ['ticket-admin-priority-create'],
            ['ticket-admin-priority-duplication', 'ticket-admin-priority-edit', 'ticket-admin-priority-delete']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
