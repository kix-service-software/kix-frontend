import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration,
    ConfiguredWidget,
    WidgetSize,
    DataType,
    ContextConfiguration,
    FilterCriteria,
    FilterDataType,
    FilterType,
    KIXObjectPropertyFilter,
    TableFilterCriteria
} from '@kix/core/dist/model';
import {
    TableColumnConfiguration, SearchOperator, ToggleOptions, TableHeaderHeight,
    TableRowHeight,
    TableConfiguration
} from '@kix/core/dist/browser';
import { HomeContextConfiguration, HomeContext } from '@kix/core/dist/browser/home';
import { TicketProperty } from '@kix/core/dist/model/';
import { TicketChartConfiguration } from '@kix/core/dist/browser/ticket';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const chartConfig1 = new TicketChartConfiguration(TicketProperty.PRIORITY_ID, {
            type: 'bar',
            data: {
                labels: ["1 very low", "2 low", "3 normal", "4 high", "5 very high"],
                datasets: [{
                    data: [0, 3, 15, 25, 4],
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
        const chart1 = new ConfiguredWidget('20180813-1-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Übersicht Ticketprioritäten', [], chartConfig1,
            false, true, WidgetSize.SMALL, null, false)
        );

        const chartConfig2 = new TicketChartConfiguration(TicketProperty.STATE_ID, {
            type: 'pie',
            data: {
                labels: ["new", "open", "pending", "escalated"],
                datasets: [{
                    label: "Ticketstatus",
                    data: [20, 50, 32, 8],
                    backgroundColor: [
                        'rgba(0, 255, 0, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(255, 0, 0, 0.8)'
                    ],
                    fill: true
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        });
        const chart2 = new ConfiguredWidget('20180813-2-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Übersicht Ticketstatus', [], chartConfig2,
            false, true, WidgetSize.SMALL, null, false)
        );

        const chartConfig3 = new TicketChartConfiguration(TicketProperty.CREATE_TIME, {
            type: 'line',
            data: {
                labels: ["7", "6", "5", "4", "3", "2", "1 (heute)"],
                datasets: [{
                    data: [5, 25, 12, 3, 30, 16, 24],
                    backgroundColor: [
                        'rgba(255, 0, 0, 0.5)'
                    ]
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
        const chart3 = new ConfiguredWidget('20180813-3-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Neue Tickets der letzten 7 Tage', [], chartConfig3,
            false, true, WidgetSize.SMALL, null, false)
        );

        const predefinedToDoTableFilter = [
            new KIXObjectPropertyFilter('Verantwortliche Tickets', [
                new TableFilterCriteria(TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS, 'CURRENT_USER')
            ]),
            new KIXObjectPropertyFilter('Bearbeiter', [
                new TableFilterCriteria(TicketProperty.OWNER_ID, SearchOperator.EQUALS, 'CURRENT_USER')
            ]),
            new KIXObjectPropertyFilter('Beobachtete Tickets', [
                new TableFilterCriteria(TicketProperty.WATCHERS, SearchOperator.EQUALS, 'CURRENT_USER', true)
            ]),
        ];
        const todoTicketList = new ConfiguredWidget('20180612-to-do-widget', new WidgetConfiguration(
            'ticket-list-widget', 'ToDo / Bearbeitung erforderlich', ['ticket-bulk-action'], new TableConfiguration(
                500, 10, [
                    new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, true, 90),
                    new TableColumnConfiguration(TicketProperty.UNSEEN, false, true, false, true, 75),
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
                [
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
                        FilterDataType.NUMERIC, FilterType.OR, 2
                    )
                ],
                true,
                true, new ToggleOptions('ticket-article-details', 'article', [], true),
                'Ticket.Age:numeric',
                TableHeaderHeight.LARGE,
                TableRowHeight.SMALL
            ),
            false, true, WidgetSize.LARGE, null, false, predefinedToDoTableFilter)
        );

        const newTicketsListWidget =
            new ConfiguredWidget('20180612-new-tickets-widget', new WidgetConfiguration(
                'ticket-list-widget', 'Neue Tickets', ['ticket-bulk-action'], new TableConfiguration(
                    500, 10, [
                        new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, true, 90),
                        new TableColumnConfiguration(TicketProperty.UNSEEN, false, true, false, true, 75),
                        new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 130),
                        new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 250),
                        new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(TicketProperty.CUSTOMER_USER_ID, true, false, true, true, 150),
                        new TableColumnConfiguration(
                            TicketProperty.AGE, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                    ],
                    [
                        new FilterCriteria(
                            TicketProperty.STATE_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.OR, 1
                        )
                    ],
                    true, true, new ToggleOptions('ticket-article-details', 'article', [], true),
                    'Ticket.-Age:numeric',
                    TableHeaderHeight.LARGE,
                    TableRowHeight.SMALL
                ),
                false, true, WidgetSize.LARGE, null, false)
            );

        const content: string[] = [
            '20180813-1-ticket-chart-widget', '20180813-2-ticket-chart-widget', '20180813-3-ticket-chart-widget',
            '20180612-to-do-widget',
            '20180612-new-tickets-widget'];
        const contentWidgets = [chart1, chart2, chart3, todoTicketList, newTicketsListWidget];

        // sidebars
        const notesSidebar =
            new ConfiguredWidget('20180607-home-notes', new WidgetConfiguration(
                'notes-widget', 'Notizen', [], {},
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
