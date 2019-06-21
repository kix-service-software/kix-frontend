import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, KIXObjectType, ContextConfiguration,
    ObjectinformationWidgetSettings, OrganisationProperty, ContactProperty, ContextMode, CRUD
} from '../../core/model/';
import { RoutingConfiguration } from '../../core/browser/router';
import { OrganisationDetailsContext } from '../../core/browser/organisation';
import { ContactDetailsContext } from '../../core/browser/contact';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { TabWidgetSettings } from '../../core/model/components/TabWidgetSettings';

export class TicketDetailsModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const tabwidget = new ConfiguredWidget('ticket-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings([
                'ticket-information-lane'
            ]), false, true)
        );

        const ticketInfoLane =
            new ConfiguredWidget('ticket-information-lane', new WidgetConfiguration(
                'ticket-info-widget', 'Translatable#Ticket Information',
                ['ticket-print-action', 'ticket-edit-action'], {},
                false, true, null, false)
            );

        const ticketHistoryLane =
            new ConfiguredWidget('ticket-history-lane', new WidgetConfiguration(
                'ticket-history-widget', 'Translatable#History', ['ticket-print-action'],
                null, true, true, null, false),
                [new UIComponentPermission('tickets/*/history', [CRUD.READ])]
            );
        const descriptionLane =
            new ConfiguredWidget('ticket-description-lane', new WidgetConfiguration(
                'ticket-description-widget', 'Translatable#Description & Comments',
                ['ticket-print-action', 'article-edit-action', 'article-maximize-action'], {},
                false, true, null, false),
                [new UIComponentPermission('tickets/*/articles', [CRUD.READ])]
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
                true, true, null, false),
                [new UIComponentPermission('links', [CRUD.READ])]
            );

        const lanes =
            [
                'ticket-details-tab-widget',
                'ticket-history-lane',
                'ticket-description-lane',
                'ticket-linked-objects-lane'
            ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            tabwidget, ticketInfoLane, descriptionLane, linkedObjectsLane, ticketHistoryLane
        ];

        const organisationRouting = new RoutingConfiguration(
            OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION,
            ContextMode.DETAILS, OrganisationProperty.ID
        );

        const contactRouting = new RoutingConfiguration(
            ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
            ContextMode.DETAILS, ContactProperty.ID
        );

        // Sidebars
        const organisationInfoSidebar =
            new ConfiguredWidget('20180116143215', new WidgetConfiguration(
                'object-information-widget', 'Translatable#Organisation', [],
                new ObjectinformationWidgetSettings(
                    KIXObjectType.ORGANISATION, [
                        OrganisationProperty.NUMBER,
                        OrganisationProperty.NAME,
                        OrganisationProperty.URL,
                        OrganisationProperty.STREET,
                        OrganisationProperty.ZIP,
                        OrganisationProperty.CITY,
                        OrganisationProperty.COUNTRY
                    ], true, [
                        [OrganisationProperty.NUMBER, organisationRouting],
                        [OrganisationProperty.NAME, organisationRouting]
                    ]
                ),
                false, false, 'kix-icon-man-house', false),
                [new UIComponentPermission('organisations', [CRUD.READ])]
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
                    ], true, [
                        [ContactProperty.LAST_NAME, contactRouting],
                        [ContactProperty.FIRST_NAME, contactRouting],
                        [ContactProperty.LOGIN, contactRouting]
                    ]
                ),
                false, false, 'kix-icon-man-bubble', false),
                [new UIComponentPermission('contacts', [CRUD.READ])]
            );
        const sidebars = ['20180116143215', '20180116143216'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [organisationInfoSidebar, contactInfoSidebar];

        // actions
        const generalActions = ['ticket-create-action'];
        const ticketActions = [
            'ticket-edit-action', 'article-new-action', 'ticket-merge-action', 'linked-objects-edit-action',
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
                    ], true, [
                        [ContactProperty.LAST_NAME, contactRouting],
                        [ContactProperty.FIRST_NAME, contactRouting],
                        [ContactProperty.LOGIN, contactRouting]
                    ]
                ),
                false, false, 'kix-icon-man-house', false),
                [new UIComponentPermission('organisations', [CRUD.READ])]
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
                    true, [
                        [OrganisationProperty.NUMBER, organisationRouting],
                        [OrganisationProperty.NAME, organisationRouting]
                    ]
                ),
                false, false, 'kix-icon-man-bubble', false),
                [new UIComponentPermission('contacts', [CRUD.READ])]
            );
        const toReceiverOverlay =
            new ConfiguredWidget('to-receiver-overlay', new WidgetConfiguration(
                'article-receiver-list', 'Translatable#Recipient: To', [], {},
                false, false, 'kix-icon-man-mail-To', false)
            );
        const ccReceiverOverlay =
            new ConfiguredWidget('cc-receiver-overlay', new WidgetConfiguration(
                'article-receiver-list', 'Translatable#Recipient: Cc', [], {},
                false, false, 'kix-icon-man-mail-Cc', false)
            );
        const bccReceiverOverlay =
            new ConfiguredWidget('bcc-receiver-overlay', new WidgetConfiguration(
                'article-receiver-list', 'Translatable#Recipient: Bcc', [], {},
                false, false, 'kix-icon-man-mail-Bcc', false)
            );
        const articleAttachmentOverlay =
            new ConfiguredWidget('article-attachment-widget', new WidgetConfiguration(
                'article-attachment-widget', 'Translatable#Attachments', ['article-attachment-zip-download'], {},
                false, false, 'kix-icon-attachement', false)
            );
        const infoOverlayWidgets = [
            organisationInfoOverlay, contactInfoOverlay,
            toReceiverOverlay, ccReceiverOverlay, bccReceiverOverlay,
            articleAttachmentOverlay
        ];

        const articleListWidget =
            new ConfiguredWidget('20180921-article-list', new WidgetConfiguration(
                'table-widget', 'Translatable#Article Overview', ['article-bulk-action', 'article-new-action'],
                {
                    objectType: KIXObjectType.ARTICLE,
                    headerComponents: ['article-attachment-count']
                },
                false, true, null, true),
                [new UIComponentPermission('tickets/*/articles', [CRUD.READ])]
            );

        const content = ['20180921-article-list'];
        const contentWidgets = [articleListWidget];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            [], [],
            lanes, laneWidgets,
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
