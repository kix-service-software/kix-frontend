import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration,
    ContextConfiguration,
    ConfiguredWidget,
    WidgetSize,
    DataType,
    TicketProperty,
    ArticleProperty,
    KIXObjectType
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
            "ticket-details-widget", "Ticket Details", ['ticket-create-action'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const ticketHistoryLane =
            new ConfiguredWidget("ticket-history-lane", new WidgetConfiguration(
                "ticket-history-widget", "Historie", ['ticket-print-action'],
                new TableConfiguration(
                    null, 7, [
                        new TableColumnConfiguration('HistoryType', true, false, true, true, 150),
                        new TableColumnConfiguration('Name', true, false, true, true, 200),
                        new TableColumnConfiguration(
                            'CreateTime', true, false, true, true, 150, true, true, false, DataType.DATE_TIME
                        ),
                        new TableColumnConfiguration('CreateBy', true, false, true, true, 200),
                        new TableColumnConfiguration(
                            ArticleProperty.ARTICLE_ID, true, false, true, true, 100, true, false, true
                        ),
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                true, true, WidgetSize.BOTH, null, false)
            );
        const descriptionLane =
            new ConfiguredWidget("ticket-description-lane", new WidgetConfiguration(
                "ticket-description-widget", "Beschreibung & Anmerkungen",
                ['ticket-print-action', 'ticket-edit-action', 'article-maximize-action'], {},
                false, true, WidgetSize.BOTH, null, false)
            );

        const linkedObjectsLane =
            new ConfiguredWidget("ticket-linked-objects-lane", new WidgetConfiguration(
                "linked-objects-widget", "Verknüpfte Objekte",
                ['ticket-print-action', 'linked-objects-edit-action'],
                {
                    linkedObjectTypes: [
                        ["Tickets", KIXObjectType.TICKET],
                        ["Config Items", KIXObjectType.CONFIG_ITEM],
                        ["FAQ", KIXObjectType.FAQ_ARTICLE],
                    ]
                },
                true, true, WidgetSize.BOTH, null, false)
            );

        const lanes =
            [
                "ticket-history-lane",
                "ticket-description-lane",
                "ticket-linked-objects-lane"
            ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            descriptionLane, linkedObjectsLane, ticketHistoryLane, ticketDetailsWidget
        ];

        const ticketInfoLane =
            new ConfiguredWidget("ticket-information-lane", new WidgetConfiguration(
                "ticket-info-widget", "Ticketinformationen", ['ticket-print-action', 'ticket-edit-action'], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const laneTabs = ["ticket-information-lane"];
        const laneTabWidgets = [ticketInfoLane];

        // Sidebars
        const customerInfoSidebar =
            new ConfiguredWidget("20180116143215", new WidgetConfiguration(
                "ticket-customer-info-widget", "Kunde", [], {
                    groups: [
                        'Stammdaten', 'Adresse'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget("20180116143216", new WidgetConfiguration(
                "ticket-contact-info-widget", "Ansprechpartner", [], {
                    groups: [
                        'Stammdaten', 'Kommunikation'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );
        const sidebars = ['20180116143215', '20180116143216'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [customerInfoSidebar, contactInfoSidebar];

        // actions
        const generalActions = ['ticket-create-action'];
        const ticketActions = [
            'ticket-edit-action', 'article-new-note-action', 'ticket-merge-action', 'linked-objects-edit-action',
            'ticket-lock-action', 'ticket-watch-action', 'ticket-spam-action',
            'ticket-print-action',
        ];

        // Overlays
        const customerInfoOverlay =
            new ConfiguredWidget("customer-info-overlay", new WidgetConfiguration(
                "ticket-customer-info", "Kunde", [], {
                    groups: [
                        'Stammdaten', 'Adresse'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoOverlay =
            new ConfiguredWidget("contact-info-overlay", new WidgetConfiguration(
                "ticket-contact-info", "Ansprechpartner", [], {
                    groups: [
                        'Stammdaten', 'Kommunikation'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );
        const toReceiverOverlay =
            new ConfiguredWidget("to-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list", "Empfänger: An", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-mail-To', false)
            );
        const ccReceiverOverlay =
            new ConfiguredWidget("cc-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list", "Empfänger: Cc", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-mail-Cc', false)
            );
        const bccReceiverOverlay =
            new ConfiguredWidget("bcc-receiver-overlay", new WidgetConfiguration(
                "article-receiver-list", "Empfänger: Bcc", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-mail-Bcc', false)
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

        const articleListWidget =
            new ConfiguredWidget("20180921-article-list", new WidgetConfiguration(
                "article-list-widget", "Artikelübersicht", [],
                {
                    generalActions: ['article-bulk-action', 'article-new-note-action'],
                    tableConfiguration: new TableConfiguration(
                        null, null, [
                            new TableColumnConfiguration(
                                'Number', true, false, false, true, 50, true, true, false, DataType.NUMBER
                            ),
                            new TableColumnConfiguration(
                                ArticleProperty.ARTICLE_INFORMATION, false, true, false, false, 50, true
                            ),
                            new TableColumnConfiguration(ArticleProperty.SENDER_TYPE_ID, true, false, true, true, 100),
                            new TableColumnConfiguration(ArticleProperty.ARTICLE_TYPE_ID, false, true, false, true, 75),
                            new TableColumnConfiguration(ArticleProperty.FROM, true, false, true, true, 225),
                            new TableColumnConfiguration(ArticleProperty.SUBJECT, true, false, true, true, 500),
                            new TableColumnConfiguration(
                                ArticleProperty.INCOMING_TIME, true, false, true, true, 120,
                                true, true, false, DataType.DATE_TIME
                            ),
                            new TableColumnConfiguration(
                                ArticleProperty.ATTACHMENT, true, true, true, false, 75, true, true, true),
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

        const content = ['20180921-article-list'];
        const contentWidgets = [articleListWidget];

        return new TicketDetailsContextConfiguration(
            this.getModuleId(),
            [],
            sidebars, sidebarWidgets,
            [],
            lanes, laneTabs,
            laneWidgets, laneTabWidgets,
            generalActions, ticketActions,
            infoOverlayWidgets,
            content, contentWidgets
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new TicketDetailsModuleFactoryExtension();
};
