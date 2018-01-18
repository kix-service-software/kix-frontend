import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    TicketDetailsDashboardConfiguration,
    WidgetConfiguration, WidgetType, DashboardConfiguration, ConfiguredWidget, WidgetSize
} from '@kix/core/dist/model/';

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
        const ticketHistoryLane =
            new ConfiguredWidget("ticket-history-lane", new WidgetConfiguration(
                "ticket-history-widget", "Historie", [], {},
                WidgetType.LANE, true, WidgetSize.BOTH, null, false)
            );
        const descriptionLane =
            new ConfiguredWidget("ticket-description-lane", new WidgetConfiguration(
                "ticket-description-widget", "Beschreibung & Anmerkung", [], {},
                WidgetType.LANE, true, WidgetSize.BOTH, null, false)
            );

        const contentRows = [
            ["ticket-information-lane", "ticket-history-widget", "ticket-description-widget"]
        ];

        const contentConfiguredWidgets: ConfiguredWidget[] = [
            ticketInfoLane, descriptionLane, ticketHistoryLane
        ];

        // Explorer
        const queueExplorer =
            new ConfiguredWidget("20171211155412", new WidgetConfiguration(
                "ticket-queue-explorer", "Übersicht Queues", [], {},
                WidgetType.EXPLORER, true, WidgetSize.SMALL, null, false)
            );
        const explorerRows: string[][] = [['20171211155412']];
        const explorerConfiguredWidgets: ConfiguredWidget[] = [queueExplorer];

        // Sidebars
        const sidebarRows = [];
        const sidebarConfiguredWidgets: ConfiguredWidget[] = [];

        // actions
        const generalActions = ['new-ticket-action'];
        const ticketActions = [
            'edit-ticket-action', 'merge-ticket-action', 'link-ticket-action',
            'lock-ticket-action', 'watch-ticket-action', 'spam-ticket-action',
            'print-ticket-action',
        ];
        return new TicketDetailsDashboardConfiguration(
            this.getModuleId(), contentRows, sidebarRows, explorerRows,
            contentConfiguredWidgets, sidebarConfiguredWidgets, explorerConfiguredWidgets, [],
            generalActions, ticketActions
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
