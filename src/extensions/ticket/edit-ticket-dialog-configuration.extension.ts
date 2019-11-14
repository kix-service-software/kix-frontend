/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditTicketDialogContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, TicketProperty, ArticleProperty,
    KIXObjectType, FormContext, ConfiguredWidget, WidgetConfiguration,
    FormFieldOption, ObjectReferenceOptions, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, OrganisationProperty, ContactProperty,
    KIXObjectProperty, QueueProperty, ObjectInformationWidgetConfiguration, HelpWidgetConfiguration,
    ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class EditTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const organisationInformation = new ObjectInformationWidgetConfiguration(
            'ticket-new-dialog-organisation-information', 'Organisation Information',
            ConfigurationType.ObjectInformation,
            KIXObjectType.ORGANISATION,
            [
                OrganisationProperty.NUMBER,
                OrganisationProperty.NAME,
                OrganisationProperty.URL,
                OrganisationProperty.STREET,
                OrganisationProperty.ZIP,
                OrganisationProperty.CITY,
                OrganisationProperty.COUNTRY
            ], true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(organisationInformation);

        const organisationInfoSidebar = new WidgetConfiguration(
            'ticket-new-dialog-organisation-widget', 'Organisation Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Organisation', [],
            new ConfigurationDefinition(
                'ticket-new-dialog-organisation-information', ConfigurationType.ObjectInformation
            ),
            null, false, false, 'kix-icon-man-house', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(organisationInfoSidebar);

        const contactInformation = new ObjectInformationWidgetConfiguration(
            'ticket-new-dialog-contact-information', 'Contact Information',
            ConfigurationType.ObjectInformation,
            KIXObjectType.CONTACT,
            [
                ContactProperty.LOGIN,
                ContactProperty.TITLE,
                ContactProperty.LASTNAME,
                ContactProperty.FIRSTNAME,
                ContactProperty.PRIMARY_ORGANISATION_ID,
                ContactProperty.PHONE,
                ContactProperty.MOBILE,
                ContactProperty.EMAIL
            ], true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(contactInformation);

        const contactInfoSidebar = new WidgetConfiguration(
            'ticket-new-dialog-contact-widget', 'Contact Widget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Contact', [],
            new ConfigurationDefinition('ticket-new-dialog-contact-information', ConfigurationType.ObjectInformation),
            null, false, false, 'kix-icon-man-bubble', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(contactInfoSidebar);

        const helpSettings = new HelpWidgetConfiguration(
            'ticket-new-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Textmodules_TicketEdit', null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'ticket-new-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Text Modules', [],
            new ConfigurationDefinition('ticket-new-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-textblocks'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpWidget);

        const widget = new WidgetConfiguration(
            'ticket-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-ticket-dialog', 'Translatable#Edit Ticket', [], null, null, false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            'ticket-new-dialog', 'Ticket New Dialog', ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget('ticket-new-dialog-organisation-widget', 'ticket-new-dialog-organisation-widget'),
                new ConfiguredWidget('ticket-new-dialog-contact-widget', 'ticket-new-dialog-contact-widget'),
                new ConfiguredWidget('ticket-new-dialog-help-widget', 'ticket-new-dialog-help-widget')
            ],
            [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'ticket-edit-dialog-widget', 'ticket-edit-dialog-widget',
                    KIXObjectType.TICKET, ContextMode.EDIT
                )
            ]
        );
    }


    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'ticket-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-title',
                'Translatable#Title', TicketProperty.TITLE, null, true,
                'Translatable#Helptext_Tickets_TicketEdit_Title'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-contact',
                'Translatable#Contact', TicketProperty.CONTACT_ID, 'ticket-input-contact', true,
                'Translatable#Helptext_Tickets_TicketEdit_Contact'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-organisation',
                'Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', true,
                'Translatable#Helptext_Tickets_TicketEdit_Organisation'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-type',
                'Translatable#Type', TicketProperty.TYPE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Type',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_TYPE),

                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-queue',
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Queue',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),

                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                ),
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ],
                            null, null,
                            [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
                            [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-channel',
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Channel',
                [
                    new FormFieldOption('NO_CHANNEL', true),
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-owner',
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Owner',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ], undefined, undefined, undefined, undefined,
                            [
                                ['requiredPermission', 'TicketRead,TicketUpdate']
                            ]
                        )
                    )
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-responsible',
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Responsible',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ], undefined, undefined, undefined, undefined,
                            [
                                ['requiredPermission', 'TicketRead,TicketUpdate']
                            ]
                        )
                    )
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-priority',
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'object-reference-input', true,
                'Translatable#Helptext_Tickets_TicketCreate_Priority',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_PRIORITY),

                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-edit-form-field-state',
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true,
                'Translatable#Helptext_Tickets_TicketEdit_State'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'ticket-edit-form-group-data', 'Translatable#Ticket Data',
                [
                    'ticket-edit-form-field-title',
                    'ticket-edit-form-field-contact',
                    'ticket-edit-form-field-organisation',
                    'ticket-edit-form-field-type',
                    'ticket-edit-form-field-queue',
                    'ticket-edit-form-field-channel',
                    'ticket-edit-form-field-owner',
                    'ticket-edit-form-field-responsible',
                    'ticket-edit-form-field-priority',
                    'ticket-edit-form-field-state'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'ticket-edit-form-page', 'Translatable#Edit Ticket',
                ['ticket-edit-form-group-data']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Ticket',
                ['ticket-edit-form-page'],
                KIXObjectType.TICKET, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TICKET, formId);
    }

}

module.exports = (data, host, options) => {
    return new EditTicketDialogModuleExtension();
};
