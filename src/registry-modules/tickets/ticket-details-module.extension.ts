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
                WidgetType.LANE_TAB, false, true, true, WidgetSize.SMALL, null, false)
            );
        const ticketHistoryLane =
            new ConfiguredWidget("ticket-history-lane", new WidgetConfiguration(
                "ticket-history-widget", "Historie", [], {},
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );
        const descriptionLane =
            new ConfiguredWidget("ticket-description-lane", new WidgetConfiguration(
                "ticket-description-widget", "Beschreibung & Anmerkung", [], {},
                WidgetType.LANE, false, true, true, WidgetSize.BOTH, null, false)
            );
        const dynamicFieldsLane =
            new ConfiguredWidget("ticket-dynamic-fields-lane", new WidgetConfiguration(
                "ticket-dynamic-fields-widget", "Zusätzliche Informationen & Felder", [], {
                    dynamicFields: [
                        'AcknowledgeName', 'KIX18DynamicField1', 'SysMonXAddress',
                        'SysMonXAlias', 'SysMonXHost', 'SysMonXService'
                    ]
                },
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );

        // info-overlay
        const infoOverlay =
            new ConfiguredWidget("info-overlay", new WidgetConfiguration(
                "info-overlay-widget", "", [], {},
                WidgetType.CONTENT, false, false, true, WidgetSize.BOTH, null, false)
            );

        const contentRows = [
            [
                "ticket-information-lane",
                "ticket-history-widget",
                "ticket-description-widget",
                "ticket-dynamic-field-widget",
            ]
        ];

        const contentConfiguredWidgets: Array<ConfiguredWidget<any>> = [
            ticketInfoLane, descriptionLane, dynamicFieldsLane, ticketHistoryLane, infoOverlay
        ];

        // Explorer
        const queueExplorer =
            new ConfiguredWidget("20171211155412", new WidgetConfiguration(
                "ticket-queue-explorer", "Übersicht Queues", [], {},
                WidgetType.EXPLORER, false, true, true, WidgetSize.SMALL, null, false)
            );
        const explorerRows: string[][] = [['20171211155412']];
        const explorerConfiguredWidgets: Array<ConfiguredWidget<any>> = [queueExplorer];

        // Sidebars
        const customerInfo =
            new ConfiguredWidget("20180116143215", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kundeninfo", [], {},
                WidgetType.SIDEBAR, false, false, true, WidgetSize.BOTH, null, false)
            );
        const contactInfo =
            new ConfiguredWidget("20180116143216", new WidgetConfiguration(
                "ticket-contact-info-widget", "Kontaktinfo", [], {},
                WidgetType.SIDEBAR, false, false, true, WidgetSize.BOTH, null, false)
            );
        const sidebarRows = [['20180116143215'], ['20180116143216']];
        const sidebarConfiguredWidgets: Array<ConfiguredWidget<any>> = [customerInfo, contactInfo];

        // actions
        const generalActions = ['new-ticket-action'];
        const ticketActions = [
            'edit-ticket-action', 'merge-ticket-action', 'link-ticket-action',
            'lock-ticket-action', 'watch-ticket-action', 'spam-ticket-action',
            'print-ticket-action',
        ];

        const generalArticleActions = [
            'new-email-article-action', 'new-note-article-action',
            'call-outgoing-article-action', 'call-incoming-article-action'
        ];
        const articleActions = [
            'print-article-action', 'edit-article-action', 'attachment-download-action', 'delete-article-action'
        ];

        return new TicketDetailsDashboardConfiguration(
            this.getModuleId(), contentRows, sidebarRows, explorerRows,
            contentConfiguredWidgets, sidebarConfiguredWidgets, explorerConfiguredWidgets, [],
            generalActions, ticketActions, generalArticleActions, articleActions
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
