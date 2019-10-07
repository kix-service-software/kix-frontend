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
    ContextConfiguration, FormField, TicketProperty, ArticleProperty,
    Form, KIXObjectType, FormContext, ConfiguredWidget, WidgetConfiguration,
    FormFieldOption, ObjectReferenceOptions, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, ObjectInformationWidgetSettings,
    OrganisationProperty, ContactProperty, CRUD, KIXObjectProperty, QueueProperty, FormFieldValue
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class EditTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const organisationInfoSidebar =
            new ConfiguredWidget('20180524110915',
                new WidgetConfiguration(
                    'object-information-widget', 'Translatable#Organisation', [],
                    new ObjectInformationWidgetSettings(KIXObjectType.ORGANISATION, [
                        OrganisationProperty.NUMBER,
                        OrganisationProperty.NAME,
                        OrganisationProperty.URL,
                        OrganisationProperty.STREET,
                        OrganisationProperty.ZIP,
                        OrganisationProperty.CITY,
                        OrganisationProperty.COUNTRY
                    ], true),
                    false, false, 'kix-icon-man-house', false
                ),
                [new UIComponentPermission('organisations', [CRUD.READ])]
            );
        const contactInfoSidebar =
            new ConfiguredWidget('20180524110920',
                new WidgetConfiguration(
                    'object-information-widget', 'Translatable#Contact', [],
                    new ObjectInformationWidgetSettings(KIXObjectType.CONTACT, [
                        ContactProperty.LOGIN,
                        ContactProperty.TITLE,
                        ContactProperty.LASTNAME,
                        ContactProperty.FIRSTNAME,
                        ContactProperty.PRIMARY_ORGANISATION_ID,
                        ContactProperty.PHONE,
                        ContactProperty.MOBILE,
                        ContactProperty.EMAIL
                    ], true),
                    false, false, 'kix-icon-man-bubble', false
                ),
                [new UIComponentPermission('contacts', [CRUD.READ])]
            );

        const helpWidget = new ConfiguredWidget('20180919-help-widget',
            new WidgetConfiguration(
                'help-widget', 'Text Modules', [], {
                    // tslint:disable-next-line:max-line-length
                    helpText: 'Translatable#Helptext_Textmodules_TicketEdit'
                }, false, false, 'kix-icon-textblocks'
            ),
            [new UIComponentPermission('system/textmodules', [CRUD.READ])]
        );

        const sidebars = ['20180524110915', '20180524110920', '20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [organisationInfoSidebar, contactInfoSidebar, helpWidget];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-ticket-form';
        const existingFormEditTicket = configurationService.getConfiguration(formId);
        if (!existingFormEditTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField('Translatable#Title', TicketProperty.TITLE, null, true, 'Translatable#Helptext_Tickets_TicketEdit_Title'));
            fields.push(new FormField(
                'Translatable#Contact', TicketProperty.CONTACT_ID, 'ticket-input-contact', true, 'Translatable#Helptext_Tickets_TicketEdit_Contact'
            ));
            fields.push(new FormField('Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', true, 'Translatable#Helptext_Tickets_TicketEdit_Organisation'));
            fields.push(new FormField(
                'Translatable#Type', TicketProperty.TYPE_ID, 'object-reference-input', true, 'Translatable#Helptext_Tickets_TicketCreate_Type', [
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
            ));
            fields.push(new FormField(
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', true, 'Translatable#Helptext_Tickets_TicketCreate_Queue', [
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
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
                                )
                            ],
                            null, null,
                            [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
                            [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            ));

            fields.push(new FormField(
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', false, 'Translatable#Helptext_Tickets_TicketEdit_Channel', [
                    new FormFieldOption('NO_CHANNEL', true),
                ])
            );

            fields.push(new FormField(
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Owner', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

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
            ));
            fields.push(new FormField(
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_TicketEdit_Responsible', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

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
            ));
            fields.push(new FormField(
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'object-reference-input', true, 'Translatable#Helptext_Tickets_TicketCreate_Priority', [
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
            ));
            fields.push(new FormField<number>(
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true,
                'Translatable#Helptext_Tickets_TicketEdit_State'
            ));

            const group = new FormGroup('Translatable#Ticket Data', fields);

            const form = new Form(
                formId, 'Translatable#Edit Ticket', [group],
                KIXObjectType.TICKET, true, FormContext.EDIT);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.TICKET, formId);
    }

}

module.exports = (data, host, options) => {
    return new EditTicketDialogModuleExtension();
};
