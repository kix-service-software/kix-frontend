import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, WidgetSize, DataType,
    FilterCriteria, FilterDataType, FilterType, KIXObjectPropertyFilter,
    TableFilterCriteria, KIXObjectType, SortOrder, ContextConfiguration, CRUD,
    TableWidgetSettings, KIXObjectLoadingOptions
} from '../../core/model';
import {
    SearchOperator, ToggleOptions, TableConfiguration, DefaultColumnConfiguration
} from '../../core/browser';
import { HomeContext } from '../../core/browser/home';
import { TicketProperty } from '../../core/model/';
import { TicketChartConfiguration } from '../../core/browser/ticket';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

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
        const chart1 = new ConfiguredWidget(
            '20180813-1-ticket-chart-widget',
            new WidgetConfiguration(
                'ticket-chart-widget', 'Overview Ticket Priorities', [], chartConfig1,
                false, true, null, false
            ),
            [new UIComponentPermission('tickets', [CRUD.READ])],
            WidgetSize.SMALL
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
        const chart2 = new ConfiguredWidget(
            '20180813-2-ticket-chart-widget',
            new WidgetConfiguration(
                'ticket-chart-widget', 'Overview Ticket States', [], chartConfig2,
                false, true, null, false
            ),
            [new UIComponentPermission('tickets', [CRUD.READ])],
            WidgetSize.SMALL
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
        const chart3 = new ConfiguredWidget(
            '20180813-3-ticket-chart-widget',
            new WidgetConfiguration(
                'ticket-chart-widget', 'Translatable#New Tickets (recent 7 days)', [], chartConfig3,
                false, true, null, false
            ),
            [new UIComponentPermission('tickets', [CRUD.READ])],
            WidgetSize.SMALL
        );

        const predefinedToDoTableFilter = [
            new KIXObjectPropertyFilter('Translatable#Responsible Tickets', [
                new TableFilterCriteria(
                    TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER
                )
            ]),
            new KIXObjectPropertyFilter('Translatable#Owner', [
                new TableFilterCriteria(TicketProperty.OWNER_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER)
            ]),
            new KIXObjectPropertyFilter('Translatable#Watched Tickets', [
                new TableFilterCriteria(
                    TicketProperty.WATCHERS, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER, true
                )
            ]),
        ];
        const todoTicketList = new ConfiguredWidget(
            '20180612-to-do-widget',
            new WidgetConfiguration(
                'table-widget', 'Translatable#ToDo / Processing required', ['bulk-action', 'csv-export-action'],
                new TableWidgetSettings(
                    KIXObjectType.TICKET, [TicketProperty.AGE, SortOrder.UP], new TableConfiguration(
                        KIXObjectType.TICKET,
                        new KIXObjectLoadingOptions(
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
                            ], 'Ticket.Age:numeric', 500, [TicketProperty.WATCHERS]
                        ), null, null, true, true, new ToggleOptions('ticket-article-details', 'article', [], true)
                    ), null, null, null, predefinedToDoTableFilter
                ),
                false, true, 'kix-icon-ticket', false
            ),
            [new UIComponentPermission('tickets', [CRUD.READ])]
        );

        const newTicketsListWidget =
            new ConfiguredWidget('20180612-new-tickets-widget',
                new WidgetConfiguration(
                    'table-widget', 'New Tickets', ['bulk-action', 'csv-export-action'],
                    new TableWidgetSettings(
                        KIXObjectType.TICKET,
                        [TicketProperty.AGE, SortOrder.DOWN],
                        new TableConfiguration(KIXObjectType.TICKET,
                            new KIXObjectLoadingOptions(
                                [
                                    new FilterCriteria(
                                        TicketProperty.STATE_ID, SearchOperator.EQUALS,
                                        FilterDataType.NUMERIC, FilterType.OR, 1
                                    )
                                ], 'Ticket.-Age:numeric', 500, [TicketProperty.WATCHERS]
                            ),
                            undefined,
                            [
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
                                    TicketProperty.ORGANISATION_ID, true, false, true, true, 225, true, true
                                ),
                                new DefaultColumnConfiguration(
                                    TicketProperty.CREATED, true, false, true, true, 155,
                                    true, true, false, DataType.DATE_TIME
                                ),
                                new DefaultColumnConfiguration(
                                    TicketProperty.AGE, true, false, true, true, 75,
                                    true, true, false, DataType.DATE_TIME
                                ),
                            ],
                            true, true, new ToggleOptions('ticket-article-details', 'article', [], true)
                        )
                    ),
                    false, true, 'kix-icon-ticket', false
                ),
                [new UIComponentPermission('tickets', [CRUD.READ])]
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
                false, false, 'kix-icon-note', false)
            );

        const sidebars = ['20180607-home-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            [], [],
            [], [],
            content, contentWidgets,
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