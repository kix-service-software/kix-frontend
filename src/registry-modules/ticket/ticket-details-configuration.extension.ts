import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, WidgetSize, KIXObjectType, ContextConfiguration,
    ObjectinformationWidgetSettings, OrganisationProperty, KIXObjectProperty, ContactProperty, ContextMode
} from '../../core/model/';
import { RoutingConfiguration } from '../../core/browser/router';
import { OrganisationDetailsContext } from '../../core/browser/organisation';
import { ContactDetailsContext } from '../../core/browser/contact';

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

        const organisationRouting = new RoutingConfiguration(
            null, OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION,
            ContextMode.DETAILS, OrganisationProperty.ID
        );

        const contactRouting = new RoutingConfiguration(
            null, ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
            ContextMode.DETAILS, ContactProperty.ID
        );

        // Sidebars
        const organisationInfoSidebar =
            new ConfiguredWidget('20180116143215', new WidgetConfiguration(
                'object-information-widget', 'Translatable#Organisation', [],
                new ObjectinformationWidgetSettings(KIXObjectType.ORGANISATION, [
                    OrganisationProperty.NUMBER,
                    OrganisationProperty.NAME,
                    OrganisationProperty.URL,
                    OrganisationProperty.STREET,
                    OrganisationProperty.ZIP,
                    OrganisationProperty.CITY,
                    OrganisationProperty.COUNTRY
                ], true, organisationRouting, [OrganisationProperty.NUMBER, OrganisationProperty.NAME]),
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoSidebar =
            new ConfiguredWidget('20180116143216', new WidgetConfiguration(
                'object-information-widget', 'Translatable#Contact', [],
                new ObjectinformationWidgetSettings(
                    KIXObjectType.CONTACT, [
                        ContactProperty.TITLE,
                        ContactProperty.LAST_NAME,
                        ContactProperty.FIRST_NAME,
                        ContactProperty.LOGIN,
                        ContactProperty.PRIMARY_ORGANISATION_ID,
                        ContactProperty.PHONE,
                        ContactProperty.MOBILE,
                        ContactProperty.FAX,
                        ContactProperty.EMAIL
                    ], true, contactRouting,
                    [ContactProperty.LAST_NAME, ContactProperty.FIRST_NAME, ContactProperty.LOGIN]),
                false, false, WidgetSize.BOTH, 'kix-icon-man-bubble', false)
            );
        const sidebars = ['20180116143215', '20180116143216'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [organisationInfoSidebar, contactInfoSidebar];

        // actions
        const generalActions = ['ticket-create-action'];
        const ticketActions = [
            'ticket-edit-action', 'article-new-note-action', 'ticket-merge-action', 'linked-objects-edit-action',
            'ticket-lock-action', 'ticket-watch-action', 'ticket-spam-action',
            'ticket-print-action',
        ];

        // Overlays
        const organisationInfoOverlay =
            new ConfiguredWidget('organisation-info-overlay', new WidgetConfiguration(
                'object-information', 'Translatable#Organisation', [],
                new ObjectinformationWidgetSettings(
                    KIXObjectType.ORGANISATION, [
                        OrganisationProperty.NUMBER,
                        OrganisationProperty.NAME,
                        OrganisationProperty.URL,
                        OrganisationProperty.STREET,
                        OrganisationProperty.ZIP,
                        OrganisationProperty.CITY,
                        OrganisationProperty.COUNTRY
                    ], true, contactRouting,
                    [ContactProperty.LAST_NAME, ContactProperty.FIRST_NAME, ContactProperty.LOGIN]
                ),
                false, false, WidgetSize.BOTH, 'kix-icon-man-house', false)
            );
        const contactInfoOverlay =
            new ConfiguredWidget('contact-info-overlay', new WidgetConfiguration(
                'object-information', 'Translatable#Contact', [],
                new ObjectinformationWidgetSettings(KIXObjectType.CONTACT, [
                    ContactProperty.LOGIN,
                    ContactProperty.TITLE,
                    ContactProperty.LAST_NAME,
                    ContactProperty.FIRST_NAME,
                    ContactProperty.PRIMARY_ORGANISATION_ID,
                    ContactProperty.PHONE,
                    ContactProperty.MOBILE,
                    ContactProperty.EMAIL
                ],
                    true, organisationRouting, [OrganisationProperty.NUMBER, OrganisationProperty.NAME]
                ),
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
            organisationInfoOverlay, contactInfoOverlay,
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

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            [], [],
            lanes, laneWidgets,
            laneTabs, laneTabWidgets,
            content, contentWidgets,
            generalActions, ticketActions,
            infoOverlayWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new TicketDetailsModuleFactoryExtension();
};
