import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ContextConfiguration, ConfiguredWidget, WidgetSize, KIXObjectType
} from '../../core/model/';
import { TicketDetailsContextConfiguration } from '../../core/browser/ticket';

export class TicketDetailsModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        // Content Widgets
        const ticketDetailsWidget = new ConfiguredWidget('ticket-details-widget', new WidgetConfiguration(
            'ticket-details-widget', 'Translatable#Ticket Details', ['ticket-create-action'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const ticketHistoryLane =
            new ConfiguredWidget('ticket-history-lane', new WidgetConfiguration(
                'ticket-history-widget', 'Translatable#History', ['ticket-print-action'],
                null, true, true, WidgetSize.BOTH, null, false)
            );
        const descriptionLane =
            new ConfiguredWidget('ticket-description-lane', new WidgetConfiguration(
                'ticket-description-widget', 'Translatable#Description & Comments',
                ['ticket-print-action', 'article-edit-action', 'article-maximize-action'], {},
                false, true, WidgetSize.BOTH, null, false)
            );

        const linkedObjectsLane =
            new ConfiguredWidget('ticket-linked-objects-lane', new WidgetConfiguration(
                'linked-objects-widget', 'Translatable#Linked Objects',
                ['ticket-print-action', 'linked-objects-edit-action'],
                {
                    linkedObjectTypes: [
                        ['Tickets', KIXObjectType.TICKET],
                        ['Config Items', KIXObjectType.CONFIG_ITEM],
                        ['FAQs', KIXObjectType.FAQ_ARTICLE],
                    ]
                },
                true, true, WidgetSize.BOTH, null, false)
            );

        const lanes =
            [
                'ticket-history-lane',
                'ticket-description-lane',
                'ticket-linked-objects-lane'
            ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            descriptionLane, linkedObjectsLane, ticketHistoryLane, ticketDetailsWidget
        ];

        const ticketInfoLane =
            new ConfiguredWidget('ticket-information-lane', new WidgetConfiguration(
                'ticket-info-widget', 'Translatable#Ticket Information',
                ['ticket-print-action', 'ticket-edit-action'], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const laneTabs = ['ticket-information-lane'];
        const laneTabWidgets = [ticketInfoLane];

        // Sidebars
        const customerInfoSidebar =
            new ConfiguredWidget('20180116143215', new WidgetConfiguration(
                'ticket-customer-info-widget', 'Translatable#Customer', [], {
                    groups: [
                        'Stammdaten', 'Adresse'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget('20180116143216', new WidgetConfiguration(
                'ticket-contact-info-widget', 'Translatable#Contact', [], {
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
            new ConfiguredWidget('customer-info-overlay', new WidgetConfiguration(
                'ticket-customer-info', 'Translatable#Customer', [], {
                    groups: [
                        'Stammdaten', 'Adresse'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoOverlay =
            new ConfiguredWidget('contact-info-overlay', new WidgetConfiguration(
                'ticket-contact-info', 'Translatable#Contact', [], {
                    groups: [
                        'Stammdaten', 'Kommunikation'
                    ]
                },
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );
        const toReceiverOverlay =
            new ConfiguredWidget('to-receiver-overlay', new WidgetConfiguration(
                'article-receiver-list', 'Translatable#Recipient: To', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-mail-To', false)
            );
        const ccReceiverOverlay =
            new ConfiguredWidget('cc-receiver-overlay', new WidgetConfiguration(
                'article-receiver-list', 'Translatable#Recipient: Cc', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-mail-Cc', false)
            );
        const bccReceiverOverlay =
            new ConfiguredWidget('bcc-receiver-overlay', new WidgetConfiguration(
                'article-receiver-list', 'Translatable#Recipient: Bcc', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-man-mail-Bcc', false)
            );
        const articleAttachmentOverlay =
            new ConfiguredWidget('article-attachment-widget', new WidgetConfiguration(
                'article-attachment-widget', 'Translatable#Attachments', ['article-attachment-zip-download'], {},
                false, false, WidgetSize.BOTH, 'kix-icon-attachement', false)
            );
        const infoOverlayWidgets = [
            customerInfoOverlay, contactInfoOverlay,
            toReceiverOverlay, ccReceiverOverlay, bccReceiverOverlay,
            articleAttachmentOverlay
        ];

        const articleListWidget =
            new ConfiguredWidget('20180921-article-list', new WidgetConfiguration(
                'table-widget', 'Translatable#Article Overview', ['article-bulk-action', 'article-new-note-action'],
                {
                    objectType: KIXObjectType.ARTICLE,
                    headerComponents: ['article-attachment-count']
                },
                false, true, WidgetSize.LARGE, null, true)
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

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new TicketDetailsModuleFactoryExtension();
};
