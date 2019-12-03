/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    KIXObjectType, FormContext, FormFieldValue,
    FormFieldOption, UserProperty,
    FormFieldOptions, InputFieldTypes, ObjectReferenceOptions, ContextConfiguration, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, RoleProperty, KIXObjectProperty, PersonalSettingsProperty,
    QueueProperty, NotificationProperty, ContextMode, WidgetConfiguration, ConfiguredDialogWidget
} from '../../core/model';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { NewUserDialogContext } from '../../core/browser/user';
import { SearchOperator } from '../../core/browser';
import { FormValidationService } from '../../core/browser/form/validation';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewUserDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'user-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-user-dialog', 'Translatable#New Agent', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'New User Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'user-new-dialog-widget', 'user-new-dialog-widget',
                        KIXObjectType.USER, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const configurationService = ConfigurationService.getInstance();

        const formId = 'user-new-form';
        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-title',
                'Translatable#Title', UserProperty.USER_TITLE, null, false,
                'Translatable#Helptext_Admin_Users_UserCreate_Title'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-firstname',
                'Translatable#First Name', UserProperty.USER_FIRSTNAME, null, true,
                'Translatable#Helptext_Admin_Users_UserCreate_FirstName'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-lastname',
                'Translatable#Last Name', UserProperty.USER_LASTNAME, null, true,
                'Translatable#Helptext_Admin_Users_UserCreate_LastName'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-login',
                'Translatable#Login Name', UserProperty.USER_LOGIN, null, true,
                'Translatable#Helptext_Admin_Users_UserCreate_Login'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-password',
                'Translatable#Password', UserProperty.USER_PASSWORD, null, true,
                'Translatable#Helptext_Admin_Users_UserCreate_Password',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ])
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-phone',
                'Translatable#Phone', UserProperty.USER_PHONE, null, false,
                'Translatable#Helptext_Admin_Users_UserCreate_Phone'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-mobile',
                'Translatable#Mobile', UserProperty.USER_MOBILE, null, false,
                'Translatable#Helptext_Admin_Users_UserCreate_Mobile'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-email',
                'Translatable#Email', UserProperty.USER_EMAIL, null, true,
                'Translatable#Helptext_Admin_Users_UserCreate_Email',
                null, null, null, null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-comment',
                'Translatable#Comment', UserProperty.USER_COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Users_UserCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Users_UserCreate_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'user-new-form-group-informations', 'Translatable#Agent Information',
                [
                    'user-new-form-field-title',
                    'user-new-form-field-firstname',
                    'user-new-form-field-lastname',
                    'user-new-form-field-login',
                    'user-new-form-field-password',
                    'user-new-form-field-phone',
                    'user-new-form-field-mobile',
                    'user-new-form-field-email',
                    'user-new-form-field-comment',
                    'user-new-form-field-valid',
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-roles',
                'Translatable#Roles', UserProperty.ROLEIDS, 'object-reference-input', false,
                'Translatable#Helptext_Admin_Users_UserCreate_Roles',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    RoleProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'user-new-form-group-roles', 'Translatable#Role Assignment', ['user-new-form-field-roles']
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-language',
                'Translatable#Language', PersonalSettingsProperty.USER_LANGUAGE, 'language-input',
                true, 'Translatable#Helptext_Admin_UserCreate_Preferences_UserLanguage', null
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-queues',
                'Translatable#My Queues', PersonalSettingsProperty.MY_QUEUES, 'object-reference-input',
                false, 'Translatable#Helptext_Admin_UserCreate_Preferences_MyQueues',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ], undefined, undefined, [QueueProperty.SUB_QUEUES], [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-new-form-field-notifications',
                'Translatable#Notifications for Tickets', PersonalSettingsProperty.NOTIFICATIONS,
                'object-reference-input', false,
                'Translatable#Helptext_Admin_UserCreate_Preferences_Notifications_Hint',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.NOTIFICATION),

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    'Data.' + NotificationProperty.DATA_VISIBLE_FOR_AGENT, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, 1
                                ),
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                                    FilterDataType.NUMERIC, FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'user-new-form-group-preferences', 'Translatable#Preferences',
                [
                    'user-new-form-field-language',
                    'user-new-form-field-queues',
                    'user-new-form-field-notifications'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'user-new-form-group-page', 'Translatable#New Agent',
                [
                    'user-new-form-group-informations',
                    'user-new-form-group-roles',
                    'user-new-form-group-preferences'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Agent',
                ['user-new-form-group-page'], KIXObjectType.USER
            )
        );
        configurationService.registerForm([FormContext.NEW], KIXObjectType.USER, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
