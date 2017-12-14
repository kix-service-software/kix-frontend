import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ConfiguredWidget, WidgetSize } from '@kix/core/dist/model/';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "tickets";
    }

    public getDefaultConfiguration(): any {
        const contentRows = [
            [
                "ticket-module-chart1",
                "ticket-module-chart2",
                "ticket-module-chart3"
            ],
            [
                "ticket-module-ticket-list"
            ]
        ];

        const contentConfiguredWidgets = [
            {
                instanceId: "ticket-module-ticket-list",
                configuration: {
                    widgetId: "ticket-list-widget",
                    title: "Tickets",
                    actions: [],
                    settings: {
                        limit: 500,
                        displayLimit: 50,
                        showTotalCount: true,
                        properties: [
                            "TicketNumber",
                            "PriorityID",
                            "StateID",
                            "TypeID",
                            "Title",
                            "Created",
                            "Age"
                        ]
                    },
                    show: true,
                    size: "large",
                    icon: null
                }
            },
            {
                instanceId: "ticket-module-chart1",
                configuration: {
                    widgetId: "chart - widget",
                    title: "Prioritäten",
                    actions: [],
                    settings: {
                        chartType: "pie"
                    },
                    show: true,
                    size: "small",
                    icon: null
                }
            },
            {
                instanceId: "ticket-module-chart2",
                configuration: {
                    widgetId: "chart-widget",
                    title: "Ticketstatus",
                    actions: [],
                    settings: {
                        chartType: "bar"
                    },
                    show: true,
                    size: "small",
                    icon: null
                }
            },
            {
                instanceId: "ticket-module-chart3",
                configuration: {
                    widgetId: "chart-widget",
                    title: "7 Tage Statistik",
                    actions: [],
                    settings: {
                        chartType: "stacked-bar"
                    },
                    show: true,
                    size: "small",
                    icon: null
                }
            }
        ];

        const explorerRows: string[][] = [
            [
                '20171211155412'
            ]
        ];

        const explorerConfiguredWidgets: ConfiguredWidget[] = [
            {
                instanceId: '20171211155412',
                configuration: {
                    widgetId: 'ticket-queue-explorer',
                    title: "Übersicht Queues",
                    actions: [],
                    settings: {},
                    show: true,
                    size: WidgetSize.SMALL,
                    icon: 'note'
                },
            }
        ];

        const sidebarRows = [
            [
                "ticket-module-notes"
            ]
        ];

        const sidebarConfiguredWidgets = [
            {
                instanceId: "ticket-module-notes",
                configuration: {
                    widgetId: "notes-widget",
                    title: "Notizen",
                    actions: [],
                    settings: {
                        notes: "Ticketnotizen"
                    },
                    show: true,
                    size: "small",
                    icon: "note"
                }
            }
        ];

        return {
            contentRows, sidebarRows, explorerRows,
            contentConfiguredWidgets, sidebarConfiguredWidgets, explorerConfiguredWidgets
        };
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
