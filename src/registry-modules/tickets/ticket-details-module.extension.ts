import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { DashboardConfiguration, ConfiguredWidget, WidgetSize } from '@kix/core/dist/model/';
import { WidgetType } from '../../../../core/dist/model/widget/WidgetType';
import { WidgetConfiguration } from '../../../../core/dist/model/widget/WidgetConfiguration';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "ticket-details";
    }

    public getDefaultConfiguration(): DashboardConfiguration {
        // Content Widgets
        const ticketInfoLane =
            new ConfiguredWidget("ticket-information-lane", new WidgetConfiguration(
                "ticket-info-widget", "Ticketinformationen", [], {},
                WidgetType.LANE_TAB, true, WidgetSize.SMALL, null, false)
            );
        const notesWidget =
            new ConfiguredWidget(
                "ticket-module-notes",
                new WidgetConfiguration(
                    "notes-widget", "Ticketnotizen", [], { notes: "Ticketnotizen" },
                    WidgetType.SIDEBAR | WidgetType.LANE_TAB, true, WidgetSize.SMALL, "note", false
                )
            );
        const contentRows = [["ticket-information-lane", "ticket-module-notes"]];
        const contentConfiguredWidgets: ConfiguredWidget[] = [ticketInfoLane, notesWidget];

        // Explorer
        const queueExplorer =
            new ConfiguredWidget("20171211155412", new WidgetConfiguration(
                "ticket-queue-explorer", "Übersicht Queues", [], {},
                WidgetType.EXPLORER, true, WidgetSize.SMALL, null, false)
            );
        const explorerRows: string[][] = [['20171211155412'], ['20171215093654']];
        const explorerConfiguredWidgets: ConfiguredWidget[] = [queueExplorer];

        // Sidebars
        const sidebarRows = [];
        const sidebarConfiguredWidgets: ConfiguredWidget[] = [];

        return new DashboardConfiguration(
            this.getModuleId(), contentRows, sidebarRows, explorerRows,
            contentConfiguredWidgets, sidebarConfiguredWidgets, explorerConfiguredWidgets, []
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
