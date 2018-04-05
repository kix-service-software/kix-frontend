import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    TicketDetailsDashboardConfiguration,
    WidgetConfiguration, WidgetType, DashboardConfiguration, ConfiguredWidget, WidgetSize, DataType
} from '@kix/core/dist/model/';
import { TableColumnConfiguration } from '@kix/core/dist/browser';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "ticket-details";
    }

    public getDefaultConfiguration(): DashboardConfiguration {
        // Content Widgets
        const ticketDetailsWidget = new ConfiguredWidget("ticket-details-widget", new WidgetConfiguration(
            "ticket-details-widget", "Ticket Details", [], null, WidgetType.CONTENT,
            false, true, true, WidgetSize.BOTH, null, false
        ));

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
                        new TableColumnConfiguration('HistoryType', true, false, true, true, 100),
                        new TableColumnConfiguration('Name', true, false, true, true, 200),
                        new TableColumnConfiguration('ArticleID', true, false, true, true, 100),
                        new TableColumnConfiguration('CreateBy', true, false, true, true, 100),
                        new TableColumnConfiguration('CreateTime', true, false, true, true, 100)
                    ]
                },
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );
        const descriptionLane =
            new ConfiguredWidget("ticket-description-lane", new WidgetConfiguration(
                "ticket-description-widget", "Beschreibung & Anmerkungen",
                ['print-ticket-action', 'edit-ticket-action', 'article-maximize-action'], {},
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
                                new TableColumnConfiguration(
                                    'TicketNumber', true, false, true, true, 100, DataType.STRING),
                                new TableColumnConfiguration('Title', true, false, true, true, 100),
                                new TableColumnConfiguration('TypeID', true, false, true, true, 100),
                                new TableColumnConfiguration('QueueID', true, false, true, true, 100),
                                new TableColumnConfiguration(
                                    'StateID', false, true, true, true, 100
                                ),
                                new TableColumnConfiguration(
                                    'Created', true, false, true, true, 100, DataType.DATE_TIME
                                ),
                                new TableColumnConfiguration(
                                    'LinkedAs', true, false, true, true, 100
                                )
                            ]
                        ]
                    ]
                },
                WidgetType.LANE, true, true, true, WidgetSize.BOTH, null, false)
            );
        const articleList =
            new ConfiguredWidget("article-list", new WidgetConfiguration(
                "article-list-widget", "Artikelübersicht", [
                    'article-print-action',
                    'article-edit-action',
                    'article-communication-action',
                    'article-tag-action',
                    'article-maximize-action'
                ],
                {
                    generalActions: [
                        'article-bulk-action', 'article-new-email-action', 'article-new-note-action',
                        'article-call-outgoing-action', 'article-call-incoming-action'
                    ],
                    tableColumns: [
                        new TableColumnConfiguration(
                            'Number', true, false, false, true, 50, DataType.NUMBER
                        ),
                        new TableColumnConfiguration('ArticleInformation', false, true, false, false, 50),
                        new TableColumnConfiguration('SenderTypeID', true, false, true, true, 100),
                        new TableColumnConfiguration('ArticleTypeID', false, true, false, true, 50),
                        new TableColumnConfiguration('ArticleTag', false, true, true, false, 50),
                        new TableColumnConfiguration('From', true, false, true, true, 225),
                        new TableColumnConfiguration('Subject', true, false, true, true, 500),
                        new TableColumnConfiguration(
                            'IncomingTime', true, false, true, true, 120, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration('Attachment', true, false, true, false, 50),
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
            dynamicFieldsLane, ticketHistoryLane, infoOverlay, articleList, ticketDetailsWidget
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
                "ticket-customer-info-widget", "Kunde", [], {},
                WidgetType.SIDEBAR, false, false, true, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const contactInfo =
            new ConfiguredWidget("20180116143216", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {},
                WidgetType.SIDEBAR, false, false, true, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const sidebars = ['20180116143215', '20180116143216'];
        const sidebarConfiguredWidgets: Array<ConfiguredWidget<any>> = [customerInfo, contactInfo];

        // actions
        const generalActions = ['new-ticket-action'];
        const ticketActions = [
            'edit-ticket-action', 'merge-ticket-action', 'link-ticket-action',
            'lock-ticket-action', 'watch-ticket-action', 'spam-ticket-action',
            'print-ticket-action',
        ];

        return new TicketDetailsDashboardConfiguration(
            this.getModuleId(), contentRows, sidebars, [],
            contentConfiguredWidgets, sidebarConfiguredWidgets, [], [],
            generalActions, ticketActions
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
