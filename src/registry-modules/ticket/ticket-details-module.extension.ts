import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration,
    ContextConfiguration,
    ConfiguredWidget,
    WidgetSize,
    DataType,
    TicketProperty,
    ArticleProperty
} from '@kix/core/dist/model/';
import {
    TableColumnConfiguration, TableConfiguration,
    ToggleOptions, TableHeaderHeight, TableRowHeight
} from '@kix/core/dist/browser';
import { TicketDetailsContextConfiguration } from '@kix/core/dist/browser/ticket';

export class TicketDetailsModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "ticket-details";
    }

    public getDefaultConfiguration(): ContextConfiguration {
        // Content Widgets
        const ticketDetailsWidget = new ConfiguredWidget("ticket-details-widget", new WidgetConfiguration(
            "ticket-details-widget", "Ticket Details", ['new-ticket-action'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const ticketHistoryLane =
            new ConfiguredWidget("ticket-history-lane", new WidgetConfiguration(
                "ticket-history-widget", "Historie", ['print-ticket-action'],
                new TableConfiguration(
                    null, 7, [
                        new TableColumnConfiguration('HistoryType', true, false, true, true, 100),
                        new TableColumnConfiguration('Name', true, false, true, true, 200),
                        new TableColumnConfiguration(ArticleProperty.ARTICLE_ID, true, false, true, true, 100),
                        new TableColumnConfiguration('CreateBy', true, false, true, true, 100),
                        new TableColumnConfiguration('CreateTime', true, false, true, true, 100)
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
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
                            "Ticket", new TableConfiguration(null, 7, [
                                new TableColumnConfiguration(
                                    TicketProperty.TICKET_NUMBER, true, false, true, true, 100, DataType.STRING),
                                new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 100),
                                new TableColumnConfiguration(TicketProperty.TYPE_ID, true, false, true, true, 100),
                                new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                                new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 100),
                                new TableColumnConfiguration(
                                    TicketProperty.CREATED, true, false, true, true, 100, DataType.DATE_TIME
                                ),
                                new TableColumnConfiguration(TicketProperty.LINKED_AS, true, false, true, true, 100)
                            ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                            )
                        ]
                    ]
                },
                true, true, WidgetSize.BOTH, null, false)
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
            dynamicFieldsLane, ticketHistoryLane, ticketDetailsWidget
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
                "ticket-customer-info-widget", "Kunde", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget("20180116143216", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
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
                "article-list-widget", "Artikelübersicht", [],
                {
                    generalActions: [
                        'article-bulk-action', 'article-new-email-action', 'article-new-note-action',
                        'article-call-outgoing-action', 'article-call-incoming-action'
                    ],
                    tableConfiguration: new TableConfiguration(
                        null, null, [
                            new TableColumnConfiguration(
                                'Number', true, false, false, true, 50, DataType.NUMBER
                            ),
                            new TableColumnConfiguration(
                                ArticleProperty.ARTICLE_INFORMATION, false, true, false, false, 50
                            ),
                            new TableColumnConfiguration(ArticleProperty.SENDER_TYPE_ID, true, false, true, true, 100),
                            new TableColumnConfiguration(ArticleProperty.ARTICLE_TYPE_ID, false, true, false, true, 50),
                            new TableColumnConfiguration(ArticleProperty.ARTICLE_TAG, false, true, true, false, 50),
                            new TableColumnConfiguration(ArticleProperty.FROM, true, false, true, true, 225),
                            new TableColumnConfiguration(ArticleProperty.SUBJECT, true, false, true, true, 500),
                            new TableColumnConfiguration(
                                ArticleProperty.INCOMING_TIME, true, false, true, true, 120, DataType.DATE_TIME
                            ),
                            new TableColumnConfiguration(ArticleProperty.ATTACHMENT, true, false, true, false, 50),
                        ], null, true,
                        true, new ToggleOptions('ticket-article-details', 'article', [
                            'article-print-action',
                            'article-edit-action',
                            'article-communication-action',
                            'article-tag-action',
                            'article-maximize-action'
                        ], true),
                        null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                    )
                },
                false, true, WidgetSize.LARGE, null, false)
            );

        // Overlays
        const customerInfoOverlay =
            new ConfiguredWidget("customer-info-overlay", new WidgetConfiguration(
                "ticket-customer-info", "Kunde", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoOverlay =
            new ConfiguredWidget("contact-info-overlay", new WidgetConfiguration(
                "ticket-contact-info", "Ansprechpartner", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );
        const toReceiverOverlay =
            new ConfiguredWidget("to-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list", "Empfänger: An", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-Man-Mail-To', false)
            );
        const ccReceiverOverlay =
            new ConfiguredWidget("cc-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list", "Empfänger: Cc", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-Man-Mail-Cc', false)
            );
        const bccReceiverOverlay =
            new ConfiguredWidget("bcc-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list", "Empfänger: Bcc", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-Man-Mail-Bcc', false)
            );
        const articleAttachmentOverlay =
            new ConfiguredWidget("article-attachment-widget", new WidgetConfiguration(
                "article-attachment-widget", "Anlagen", ['article-attachment-zip-download'], {},
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

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new TicketDetailsModuleFactoryExtension();
};
