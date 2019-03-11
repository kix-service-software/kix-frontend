import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, WidgetSize, DataType, ContextConfiguration,
    FilterCriteria, FilterDataType, FilterType, KIXObjectPropertyFilter, TableFilterCriteria, KIXObjectType, SortOrder
} from '../../core/model';
import {
    SearchOperator, ToggleOptions, TableHeaderHeight, TableRowHeight, TableConfiguration, DefaultColumnConfiguration
} from '../../core/browser';
import { HomeContextConfiguration, HomeContext } from '../../core/browser/home';
import { TicketProperty } from '../../core/model/';
import { TicketChartConfiguration } from '../../core/browser/ticket';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

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
            'ticket-chart-widget', 'Overview Ticket Priorities', [], chartConfig1,
            false, true, WidgetSize.SMALL, null, false)
        );

        const chartConfig2 = new TicketChartConfiguration(TicketProperty.STATE_ID, {
            type: 'pie',
            data: {
                labels: ["new", "open", "pending", "escalated"],
                datasets: [{
                    label: "Ticket State",
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
            'ticket-chart-widget', 'Overview Ticket States', [], chartConfig2,
            false, true, WidgetSize.SMALL, null, false)
        );

        const chartConfig3 = new TicketChartConfiguration(TicketProperty.CREATE_TIME, {
            type: 'line',
            data: {
                labels: ["7", "6", "5", "4", "3", "2", "1 (today)"],
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
            'ticket-chart-widget', 'New Tickets (recent 7 days)', [], chartConfig3,
            false, true, WidgetSize.SMALL, null, false)
        );

        const predefinedToDoTableFilter = [
            new KIXObjectPropertyFilter('Responsible Tickets', [
                new TableFilterCriteria(
                    TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER
                )
            ]),
            new KIXObjectPropertyFilter('Owner', [
                new TableFilterCriteria(TicketProperty.OWNER_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER)
            ]),
            new KIXObjectPropertyFilter('Watched Tickets', [
                new TableFilterCriteria(
                    TicketProperty.WATCHERS, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER, true
                )
            ]),
        ];
        const todoTicketList = new ConfiguredWidget('20180612-to-do-widget', new WidgetConfiguration(
            'table-widget', 'ToDo / Processing required', ['bulk-action', 'csv-export-action'],
            {
                objectType: KIXObjectType.TICKET,
                sort: [TicketProperty.AGE, SortOrder.UP],
                tableConfiguration: new TableConfiguration(KIXObjectType.TICKET,
                    500, null, null,
                    [
                        new FilterCriteria(
                            TicketProperty.OWNER_ID, SearchOperator.EQUALS,
                            FilterDataType.STRING, FilterType.OR, KIXObjectType.CURRENT_USER
                        ),
                        new FilterCriteria(
                            TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS,
                            FilterDataType.STRING, FilterType.OR, KIXObjectType.CURRENT_USER
                        ),
                        new FilterCriteria(
                            TicketProperty.LOCK_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.OR, 2
                        )
                    ],
                    true, true, new ToggleOptions('ticket-article-details', 'article', [], true),
                    'Ticket.Age:numeric'
                )
            },
            false, true, WidgetSize.LARGE, 'kix-icon-ticket', false, predefinedToDoTableFilter)
        );

        const newTicketsListWidget =
            new ConfiguredWidget('20180612-new-tickets-widget', new WidgetConfiguration(
                'table-widget', 'New Tickets', ['bulk-action', 'csv-export-action'],
                {
                    objectType: KIXObjectType.TICKET,
                    sort: [TicketProperty.AGE, SortOrder.DOWN],
                    tableConfiguration: new TableConfiguration(KIXObjectType.TICKET,
                        500, null, [
                            new DefaultColumnConfiguration(
                                TicketProperty.PRIORITY_ID, false, true, true, false, 65, true, true, true
                            ),
                            new DefaultColumnConfiguration(
                                TicketProperty.TICKET_NUMBER, true, false, true, true, 135, true, true
                            ),
                            new DefaultColumnConfiguration(
                                TicketProperty.TITLE, true, false, true, true, 463, true, true
                            ),
                            new DefaultColumnConfiguration(
                                TicketProperty.QUEUE_ID, true, false, true, true, 175, true, true, true
                            ),
                            new DefaultColumnConfiguration(
                                TicketProperty.CUSTOMER_ID, true, false, true, true, 225, true, true
                            ),
                            new DefaultColumnConfiguration(
                                TicketProperty.CREATED, true, false, true, true, 155,
                                true, true, false, DataType.DATE_TIME
                            ),
                            new DefaultColumnConfiguration(
                                TicketProperty.AGE, true, false, true, true, 75, true, true, false, DataType.DATE_TIME
                            ),
                        ],
                        [
                            new FilterCriteria(
                                TicketProperty.STATE_ID, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.OR, 1
                            )
                        ],
                        true, true, new ToggleOptions('ticket-article-details', 'article', [], true),
                        'Ticket.-Age:numeric'
                    )
                },
                false, true, WidgetSize.LARGE, 'kix-icon-ticket', false)
            );

        const content: string[] = [
            '20180813-1-ticket-chart-widget', '20180813-2-ticket-chart-widget', '20180813-3-ticket-chart-widget',
            '20180612-to-do-widget',
            '20180612-new-tickets-widget'];
        const contentWidgets = [chart1, chart2, chart3, todoTicketList, newTicketsListWidget];

        // sidebars
        const notesSidebar =
            new ConfiguredWidget('20180607-home-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
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

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
