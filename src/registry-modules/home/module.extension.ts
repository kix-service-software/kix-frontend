import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration,
    ConfiguredWidget,
    WidgetSize,
    DataType,
    ContextConfiguration,
    FilterCriteria,
    FilterDataType,
    FilterType
} from '@kix/core/dist/model';
import {
    TableColumnConfiguration, SearchOperator, ToggleOptions, TableHeaderHeight,
    TableRowHeight
} from '@kix/core/dist/browser';
import { HomeContextConfiguration, HomeContext } from '@kix/core/dist/browser/home';
import { TicketProperty } from '@kix/core/dist/model/';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const todoTicketList =
            new ConfiguredWidget("20180612-to-do-widget", new WidgetConfiguration(
                "ticket-list-widget", "ToDo / Bearbeitung erforderlich", ['bulk-ticket-action'], {
                    limit: 500,
                    displayLimit: 10,
                    showTotalCount: true,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, true, 75),
                        new TableColumnConfiguration(TicketProperty.TICKET_FLAG, false, true, false, true, 90),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 200),
                        new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 75),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 75),
                        new TableColumnConfiguration(TicketProperty.RESPONSIBLE_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.OWNER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.CHANGED, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                    ],
                    filter: [
                        new FilterCriteria(
                            TicketProperty.OWNER_ID, SearchOperator.EQUALS,
                            FilterDataType.STRING, FilterType.OR, 'CURRENT_USER'
                        ),
                        new FilterCriteria(
                            TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS,
                            FilterDataType.STRING, FilterType.OR, 'CURRENT_USER'
                        ),
                        new FilterCriteria(
                            TicketProperty.LOCK_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.AND, 2
                        )
                    ],
                    toggleOptions: new ToggleOptions('ticket-article-details', 'article', [], true),
                    sortOrder: "-Ticket.Age",
                    headerHeight: TableHeaderHeight.LARGE,
                    rowHeight: TableRowHeight.SMALL
                },
                false, true, WidgetSize.LARGE, null, true)
            );

        const newTicketsListWidget =
            new ConfiguredWidget("20180612-new-tickets-widget", new WidgetConfiguration(
                "ticket-list-widget", "Neue Tickets", ['bulk-ticket-action'], {
                    limit: 500,
                    displayLimit: 10,
                    showTotalCount: true,
                    tableColumns: [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, true, 75),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 250),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_USER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                    ],
                    filter: [
                        new FilterCriteria(
                            TicketProperty.STATE_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.OR, 1
                        )
                    ],
                    toggleOptions: new ToggleOptions('ticket-article-details', 'article', [], true),
                    sortOrder: "Ticket.Age",
                    headerHeight: TableHeaderHeight.LARGE,
                    rowHeight: TableRowHeight.SMALL
                },
                false, true, WidgetSize.LARGE, null, true)
            );

        const content: string[] = ['20180612-to-do-widget', '20180612-new-tickets-widget'];
        const contentWidgets = [todoTicketList, newTicketsListWidget];

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
