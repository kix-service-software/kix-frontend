import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration,
    WidgetType,
    ConfiguredWidget,
    WidgetSize,
    DataType,
    ContextConfiguration,
    FilterCriteria,
    FilterDataType,
    FilterType
} from '@kix/core/dist/model';
import { TableColumnConfiguration, SearchOperator } from '@kix/core/dist/browser';
import { HomeContextConfiguration, HomeContext } from '@kix/core/dist/browser/home';
import { TicketProperty } from '@kix/core/dist/model/';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const generalActions = [
            'bulk-ticket-action'
        ];
        const ticketListWidget =
            new ConfiguredWidget("20180612-to-do-widget", new WidgetConfiguration(
                "ticket-list-widget", "ToDo / Bearbeitung erforderlich", generalActions, {
                    limit: 500,
                    displayLimit: 15,
                    showTotalCount: true,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, false, 100),
                        new TableColumnConfiguration(TicketProperty.TICKET_FLAG, false, true, false, false, 100),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 200),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, true, true, true, 100),
                        new TableColumnConfiguration(TicketProperty.RESPONSIBLE_ID, true, true, true, true, 200),
                        new TableColumnConfiguration(TicketProperty.OWNER_ID, true, true, true, true, 200),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_ID, true, true, true, true, 200),
                        new TableColumnConfiguration(
                            TicketProperty.CREATED, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                    ],
                    filter: [
                        new FilterCriteria(
                            TicketProperty.CUSTOMER_ID,
                            SearchOperator.EQUALS,
                            FilterDataType.STRING,
                            FilterType.AND,
                            ''
                        )
                    ]
                },
                false, true, WidgetSize.LARGE, null, true)
            );

        const content: string[] = ['20180612-to-do-widget'];
        const contentWidgets = [ticketListWidget];

        // sidebars
        const notesSidebar =
            new ConfiguredWidget("20180607-home-notes", new WidgetConfiguration(
                "notes-widget", "Notizen", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20180607-home-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new HomeContextConfiguration(
            this.getModuleId(),
            [],
            sidebars,
            sidebarWidgets,
            [],
            content,
            contentWidgets,
            [],
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
