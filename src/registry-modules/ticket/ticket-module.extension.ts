import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ConfiguredWidget, WidgetConfiguration, WidgetSize, KIXObjectPropertyFilter, TableFilterCriteria, TicketProperty
} from '@kix/core/dist/model';
import { TicketContextConfiguration, TicketContext } from '@kix/core/dist/browser/ticket';
import {
    ToggleOptions, TableHeaderHeight, TableRowHeight, TableConfiguration, SearchOperator
} from '@kix/core/dist/browser';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return TicketContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): any {
        const queueExplorer =
            new ConfiguredWidget('20180813-ticket-queue-explorer', new WidgetConfiguration(
                'ticket-queue-explorer', 'Queues', [], {},
                false, false, WidgetSize.SMALL, null
            ));

        const explorer = ['20180813-ticket-queue-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [queueExplorer];

        // sidebars
        const notesSidebar =
            new ConfiguredWidget('20180814-ticket-notes', new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20180814-ticket-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];


        const predefinedTicketFilter = [
            new KIXObjectPropertyFilter('Bearbeiter', [
                new TableFilterCriteria(TicketProperty.OWNER_ID, SearchOperator.EQUALS, 'CURRENT_USER')
            ]),
            new KIXObjectPropertyFilter('Beobachtete Tickets', [
                new TableFilterCriteria(TicketProperty.WATCHERS, SearchOperator.EQUALS, 'CURRENT_USER', true)
            ]),
            new KIXObjectPropertyFilter('Eskalierte Tickets', [
                new TableFilterCriteria(TicketProperty.ESCALATION_TIME, SearchOperator.LESS_THAN, 0)
            ]),
            new KIXObjectPropertyFilter('Freie Tickets', [
                new TableFilterCriteria(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 1)
            ]),
            new KIXObjectPropertyFilter('Gesperrte Tickets', [
                new TableFilterCriteria(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 2)
            ]),
            new KIXObjectPropertyFilter('Verantwortliche Tickets', [
                new TableFilterCriteria(TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS, 'CURRENT_USER')
            ]),


        ];
        const ticketListWidget =
            new ConfiguredWidget('20180814-ticket-list-widget', new WidgetConfiguration(
                'ticket-list-widget', 'Übersicht Tickets', [
                    'new-ticket-action', 'ticket-search-action', 'csv-export-action'
                ], new TableConfiguration(
                    2500, 25, null, null, true, true,
                    new ToggleOptions('ticket-article-details', 'article', [], true),
                    null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                ),
                false, false, WidgetSize.LARGE, null, true, predefinedTicketFilter)
            );

        const content = ['20180814-ticket-list-widget'];
        const contentWidgets = [ticketListWidget];

        return new TicketContextConfiguration(
            this.getModuleId(), explorer, sidebars, sidebarWidgets, explorerWidgets, content, contentWidgets, []
        );
    }

    public async createFormDefinitions(): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
