import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    TicketDetailsDashboardConfiguration,
    WidgetConfiguration, WidgetType, DashboardConfiguration, ConfiguredWidget, WidgetSize, DataType
} from '@kix/core/dist/model/';
import { StandardTableColumn } from '@kix/core/dist/browser';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "ticket-details";
    }

    public getDefaultConfiguration(): DashboardConfiguration {
        // Content Widgets
        const ticketInfoLane =
            new ConfiguredWidget("ticket-information-lane", new WidgetConfiguration(
                "ticket-info-widget", "Ticketinformationen", ['print-ticket-action', 'edit-ticket-action'], {},
                WidgetType.LANE_TAB, false, true, true, WidgetSize.SMALL, null, false)
            );
        const ticketHistoryLane =
            new ConfiguredWidget("ticket-history-lane", new WidgetConfiguration(
                "ticket-history-widget", "Historie", ['print-ticket-action'],
                {
                    tableColumns: [
                        new StandardTableColumn('HistoryType', '', false, true, false, true, true, 100),
                        new StandardTableColumn('Name', '', false, true, false, true, true, 200),
                        new StandardTableColumn('ArticleID', '', false, true, false, true, true, 100),
                        new StandardTableColumn('CreateBy', '', false, true, false, true, true, 100),
                        new StandardTableColumn('CreateTime', '', false, true, false, true, true, 100)
                    ]
                },
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );
        const descriptionLane =
            new ConfiguredWidget("ticket-description-lane", new WidgetConfiguration(
                "ticket-description-widget", "Beschreibung & Anmerkungen",
                ['print-ticket-action', 'edit-ticket-action'], {},
                WidgetType.LANE, false, true, true, WidgetSize.BOTH, null, false)
            );
        const processLane =
            new ConfiguredWidget("ticket-process-lane", new WidgetConfiguration(
                "ticket-dynamic-fields-widget", "Prozessinformationen", ['print-ticket-action'], {
                    dynamicFields: [2530, 2531, 2532, 2533, 2534, 2535, 2536, 2537, 2538]
                },
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );
        const dynamicFieldsLane =
            new ConfiguredWidget("ticket-dynamic-fields-lane", new WidgetConfiguration(
                "ticket-dynamic-fields-widget", "Zusätzliche Informationen & Felder",
                ['print-ticket-action', 'edit-ticket-action'], {
                    dynamicFields: [2530, 2531, 2532, 2533, 2534, 2535, 2536, 2537, 2538]
                },
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );
        const linkedObjectsLane =
            new ConfiguredWidget("ticket-linked-objects-lane", new WidgetConfiguration(
                "ticket-linked-objects-widget", "Verknüpfte Objekte", ['print-ticket-action', 'edit-ticket-action'],
                {
                    groups: [
                        [
                            "Ticket", [
                                new StandardTableColumn(
                                    'TicketNumber', '', true, true, false, true, true, 100, DataType.STRING),
                                new StandardTableColumn('Title', '', true, true, false, true, true, 100),
                                new StandardTableColumn('TypeID', 'TypeID', true, true, false, true, true, 100),
                                new StandardTableColumn('QueueID', 'QueueID', true, true, false, true, true, 100),
                                new StandardTableColumn('StateID', 'TicketState', true, false, true, true, true, 100),
                                new StandardTableColumn(
                                    'Created', 'Created',
                                    true, true, false, true, true, 100,
                                    DataType.DATE_TIME
                                ),
                                new StandardTableColumn('LinkedAs', 'LinkedAs', false, true, false, true, true, 100)
                            ]
                        ]
                    ]
                },
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );
        const articleList =
            new ConfiguredWidget("article-list", new WidgetConfiguration(
                "article-list-widget", "Artikelübersicht", [
                    'print-article-action', 'edit-article-action', 'attachment-download-action', 'delete-article-action'
                ],
                {
                    tableColumns: [
                        new StandardTableColumn('Number', '', false, true, false, true, true, 100),
                        new StandardTableColumn('SenderTypeID', '', false, true, false, true, true, 100),
                        new StandardTableColumn('ArticleTypeID', '', false, true, false, true, true, 100),
                        new StandardTableColumn('From', '', false, true, false, true, true, 100),
                        new StandardTableColumn('Subject', '', false, true, false, true, true, 100),
                        new StandardTableColumn(
                            'IncomingTime', '', false, true, false, true, true, 100, DataType.DATE_TIME
                        ),
                        new StandardTableColumn('Attachments', '', false, true, false, true, true, 100),
                    ]
                },
                WidgetType.CONTENT, false, true, true, WidgetSize.LARGE, null, false)
            );

        // info-overlay
        // TODO: eigener Widget-Typ
        const infoOverlay =
            new ConfiguredWidget("info-overlay", new WidgetConfiguration(
                "info-overlay-widget", "", [], {},
                WidgetType.CONTENT, false, false, true, WidgetSize.BOTH, null, false)
            );

        const contentRows = [
            [
                "ticket-information-lane",
                "ticket-history-lane",
                "ticket-description-lane",
                "ticket-dynamic-fields-lane",
                "ticket-process-lane",
                "ticket-linked-objects-lane"
            ]
        ];

        const contentConfiguredWidgets: Array<ConfiguredWidget<any>> = [
            ticketInfoLane, descriptionLane, linkedObjectsLane, processLane,
            dynamicFieldsLane, ticketHistoryLane, infoOverlay, articleList
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
