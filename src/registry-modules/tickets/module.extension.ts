import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize
} from '@kix/core/dist/model/';
import { TicketContextConfiguration } from '@kix/core/dist/browser/ticket';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "tickets";
    }

    public getDefaultConfiguration(): any {

        const ticketListWidget =
            new ConfiguredWidget("ticket-module-ticket-list", new WidgetConfiguration(
                "ticket-list-widget", "Tickets", [], {
                    limit: 500,
                    displayLimit: 50,
                    showTotalCount: true,
                    properties: ["TicketNumber", "PriorityID", "StateID", "TypeID", "Title", "Created", "Age"]
                },
                false, true, WidgetSize.LARGE, null, true)
            );

        const chart1 =
            new ConfiguredWidget("ticket-module-chart1", new WidgetConfiguration(
                "chart-widget", "Prioritäten", [], {
                    chartType: "pie",
                    templateId: 'ticket-dashboard-priorities',
                    attributes: ['PriorityID'],
                    showLegend: true,
                    showAxes: true,
                    showValues: true
                },
                false, true, WidgetSize.SMALL, null, true)
            );

        const chart2 =
            new ConfiguredWidget("ticket-module-chart2", new WidgetConfiguration(
                "chart-widget", "Ticketstatus", [], {
                    chartType: "bar",
                    templateId: 'ticket-dashboard-states',
                    attributes: ['StateID'],
                    showLegend: true,
                    showAxes: true,
                    showValues: true
                },
                false, true, WidgetSize.SMALL, null, true)
            );

        const chart3 =
            new ConfiguredWidget("ticket-module-chart3", new WidgetConfiguration(
                "chart-widget", "7 Tage Statistik", [], {
                    chartType: "stacked-bar",
                    templateId: 'home-dashboard-7days',
                    attributes: [],
                    showLegend: true,
                    showAxes: true,
                    showValues: true
                },
                false, true, WidgetSize.SMALL, null, true)
            );

        const contentRows = [
            ["ticket-module-chart1", "ticket-module-chart2", "ticket-module-chart3"],
            ["ticket-module-ticket-list"]
        ];
        const contentConfiguredWidgets = [ticketListWidget, chart1, chart2, chart3];


        const queueExplorer =
            new ConfiguredWidget("20171211155412", new WidgetConfiguration(
                "ticket-queue-explorer", "Übersicht Queues", [], {},
                false, true, WidgetSize.SMALL, null, false)
            );
        const servicesExplorer =
            new ConfiguredWidget("20171215093654", new WidgetConfiguration(
                "ticket-service-explorer", "Übersicht Services", [], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const explorerRows: string[][] = [['20171211155412'], ['20171215093654']];
        const explorerConfiguredWidgets: Array<ConfiguredWidget<any>> = [queueExplorer, servicesExplorer];

        const notesWidget =
            new ConfiguredWidget(
                "ticket-module-notes",
                new WidgetConfiguration(
                    "notes-widget", "Notizen", [], { notes: "Ticketnotizen" },
                    false, true, WidgetSize.SMALL, "note", false
                )
            );
        const sidebars = ["ticket-module-notes"];
        const sidebarConfiguredWidgets: Array<ConfiguredWidget<any>> = [notesWidget];

        return new TicketContextConfiguration(this.getModuleId(), [], [], [], []);
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
