import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ContextConfiguration, ConfiguredWidget, WidgetSize, DataType
} from '@kix/core/dist/model/';
import { TableColumnConfiguration } from '@kix/core/dist/browser';
import { TicketDetailsContextConfiguration } from '@kix/core/dist/browser/ticket';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "ticket-details";
    }

    public getDefaultConfiguration(): ContextConfiguration {
        // Content Widgets
        const ticketDetailsWidget = new ConfiguredWidget("ticket-details-widget", new WidgetConfiguration(
            "ticket-details-widget", "Ticket Details", [], null,
            false, true, WidgetSize.BOTH, null, false
        ));

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
                true, true, WidgetSize.BOTH, null, false)
            );
        const descriptionLane =
            new ConfiguredWidget("ticket-description-lane", new WidgetConfiguration(
                "ticket-description-widget", "Beschreibung & Anmerkungen",
                ['print-ticket-action', 'edit-ticket-action', 'article-maximize-action'], {},
                false, true, WidgetSize.BOTH, null, false)
            );
        const processLane =
            new ConfiguredWidget("ticket-process-lane", new WidgetConfiguration(
                "ticket-dynamic-fields-widget", "Prozessinformationen", ['print-ticket-action'], {
                    dynamicFields: [2530, 2531, 2532, 2533, 2534, 2535, 2536, 2537, 2538]
                },
                true, true, WidgetSize.BOTH, null, false)
            );
        const dynamicFieldsLane =
            new ConfiguredWidget("ticket-dynamic-fields-lane", new WidgetConfiguration(
                "ticket-dynamic-fields-widget", "Zusätzliche Informationen & Felder",
                ['print-ticket-action', 'edit-ticket-action', 'article-maximize-action'], {
                    dynamicFields: [2530, 2531, 2532, 2533, 2534, 2535, 2536, 2537, 2538]
                },
                true, true, WidgetSize.BOTH, null, false)
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
                true, true, WidgetSize.BOTH, null, false)
            );

        // info-overlay
        // TODO: eigener Widget-Typ
        const infoOverlay =
            new ConfiguredWidget("info-overlay", new WidgetConfiguration(
                "info-overlay-widget", "", [], {}, false, false, WidgetSize.BOTH, null, false)
            );

        const lanes =
            [
                "ticket-history-lane",
                "ticket-description-lane",
                "ticket-dynamic-fields-lane",
                "ticket-process-lane",
                "ticket-linked-objects-lane"
            ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            descriptionLane, linkedObjectsLane, processLane,
            dynamicFieldsLane, ticketHistoryLane, infoOverlay, ticketDetailsWidget
        ];

        const ticketInfoLane =
            new ConfiguredWidget("ticket-information-lane", new WidgetConfiguration(
                "ticket-info-widget", "Ticketinformationen", ['print-ticket-action', 'edit-ticket-action'], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const laneTabs = ["ticket-information-lane"];
        const laneTabWidgets = [ticketInfoLane];

        // Sidebars
        const customerInfoSidebar =
            new ConfiguredWidget("20180116143215", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kunde", [], {}, false, false, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget("20180116143216", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const sidebars = ['20180116143215', '20180116143216'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [customerInfoSidebar, contactInfoSidebar];

        // actions
        const generalActions = ['new-ticket-action'];
        const ticketActions = [
            'edit-ticket-action', 'merge-ticket-action', 'link-ticket-action',
            'lock-ticket-action', 'watch-ticket-action', 'spam-ticket-action',
            'print-ticket-action',
        ];

        const articleWidget =
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
                false, true, WidgetSize.LARGE, null, false)
            );

        // Overlays
        const customerInfoOverlay =
            new ConfiguredWidget("customer-info-overlay", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kunde1", [], {}, false, false, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const contactInfoOverlay =
            new ConfiguredWidget("contact-info-overlay", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner1", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const toReceiverOverlay =
            new ConfiguredWidget("to-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list-widget", "Empfänger: An", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const ccReceiverOverlay =
            new ConfiguredWidget("cc-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list-widget", "Empfänger: CC", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const bccReceiverOverlay =
            new ConfiguredWidget("bcc-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list-widget", "Empfänger: BCC", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man', false)
            );
        const articleAttachmentOverlay =
            new ConfiguredWidget("article-attachment-widget", new WidgetConfiguration(
                "article-receiver-list-widget", "Anlagen", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-attachement', false)
            );
        const infoOverlayWidgets = [
            customerInfoOverlay, contactInfoOverlay,
            toReceiverOverlay, ccReceiverOverlay, bccReceiverOverlay,
            articleAttachmentOverlay
        ];

        return new TicketDetailsContextConfiguration(
            this.getModuleId(),
            [],
            sidebars,
            sidebarWidgets,
            [],
            lanes,
            laneTabs,
            laneWidgets,
            laneTabWidgets,
            articleWidget,
            generalActions,
            ticketActions,
            infoOverlayWidgets
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
