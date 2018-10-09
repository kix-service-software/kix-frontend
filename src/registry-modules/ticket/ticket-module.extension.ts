import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ConfiguredWidget, WidgetConfiguration, WidgetSize, KIXObjectPropertyFilter, TableFilterCriteria,
    TicketProperty, FilterCriteria, FilterDataType, FilterType
} from '@kix/core/dist/model';
import { TicketContextConfiguration, TicketContext, TicketChartConfiguration } from '@kix/core/dist/browser/ticket';
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

        // content

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
        const chart1 = new ConfiguredWidget('20180814-1-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Übersicht Ticketprioritäten', [], chartConfig1,
            false, true, WidgetSize.SMALL, null, true)
        );

        const chartConfig2 = new TicketChartConfiguration(TicketProperty.STATE_ID, {
            type: 'pie',
            data: {
                labels: ["new", "open", "pending", "escalated"],
                datasets: [{
                    label: "Ticketstatus",
                    data: [20, 50, 32, 8],
                    fill: true,
                    backgroundColor: [
                        "rgba(255, 0, 0, 0.8)",
                        "rgba(255, 0, 0, 0.6)",
                        "rgba(255, 0, 0, 0.4)",
                        "rgba(255, 0, 0, 0.2)",
                        "rgba(0, 0, 255, 0.8)",
                        "rgba(0, 0, 255, 0.6)",
                        "rgba(0, 0, 255, 0.4)",
                        "rgba(0, 0, 255, 0.2)",
                        "rgba(0, 255, 0, 0.8)",
                        "rgba(0, 255, 0, 0.6)",
                        "rgba(0, 255, 0, 0.4)"
                    ]
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        padding: 2,
                        fontSize: 10
                    }
                }
            }
        });
        const chart2 = new ConfiguredWidget('20180814-2-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Übersicht Ticketstatus', [], chartConfig2,
            false, true, WidgetSize.SMALL, null, true)
        );

        const chartConfig3 = new TicketChartConfiguration(TicketProperty.CREATED, {
            type: 'line',
            data: {
                labels: ["1", "2", "3", "4", "5", "6", "7"],
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
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }]
                }
            }
        } as any);
        const chart3 = new ConfiguredWidget('20180814-3-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Neue Tickets der letzten 7 Tage', [], chartConfig3,
            false, true, WidgetSize.SMALL, null, true)
        );

        const ticketListWidget =
            new ConfiguredWidget('20180814-ticket-list-widget', new WidgetConfiguration(
                'ticket-list-widget', 'Übersicht Tickets', [
                    'ticket-create-action', 'ticket-bulk-action', 'csv-export-action', 'ticket-search-action'
                ], new TableConfiguration(
                    1000, 25, null, [new FilterCriteria(
                        'StateType', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
                    )],
                    true, true,
                    new ToggleOptions('ticket-article-details', 'article', [], true),
                    null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                ),
                false, false, WidgetSize.LARGE, 'kix-icon-ticket', true, predefinedTicketFilter)
            );

        const content = [
            '20180814-1-ticket-chart-widget', '20180814-2-ticket-chart-widget',
            '20180814-3-ticket-chart-widget', '20180814-ticket-list-widget'
        ];
        const contentWidgets = [chart1, chart2, chart3, ticketListWidget];

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
