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
    FilterCriteria, RoleProperty, FilterDataType, FilterType, KIXObjectProperty, PersonalSettingsProperty,
    QueueProperty, NotificationProperty, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../core/model';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { EditUserDialogContext } from '../../core/browser/user';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditUserDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'user-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-user-dialog', 'Translatable#Edit Agent', [], null, null,
            false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), 'Edit User Dialog', ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'user-edit-dialog-widget', 'user-edit-dialog-widget',
                    KIXObjectType.USER, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'user-edit-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-title',
                'Translatable#Title', UserProperty.USER_TITLE, null, false,
                'Translatable#Helptext_Admin_Users_UserEdit_Title'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-firstname',
                'Translatable#First Name', UserProperty.USER_FIRSTNAME, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_FirstName'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-lastname',
                'Translatable#Last Name', UserProperty.USER_LASTNAME, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_LastName'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-login',
                'Translatable#Login Name', UserProperty.USER_LOGIN, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_Login'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-password',
                'Translatable#Password', UserProperty.USER_PASSWORD, null, false,
                'Translatable#Helptext_Admin_Users_UserEdit_Password',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ], null, null, null, null, null, null, null, null, null, null, null, null, null,
                'Translatable#not modified'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-phone',
                'Translatable#Phone', UserProperty.USER_PHONE, null, false,
                'Translatable#Helptext_Admin_Users_UserEdit_Phone'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-mobile',
                'Translatable#Mobile', UserProperty.USER_MOBILE, null, false,
                'Translatable#Helptext_Admin_Users_UserEdit_Mobile'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-email',
                'Translatable#Email', UserProperty.USER_EMAIL, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_Email'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-comment',
                'Translatable#Comment', UserProperty.USER_COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Users_UserEdit_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Users_UserEdit_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'user-edit-form-group-informations', 'Translatable#Agent Information',
                [
                    'user-edit-form-field-title',
                    'user-edit-form-field-firstname',
                    'user-edit-form-field-lastname',
                    'user-edit-form-field-login',
                    'user-edit-form-field-password',
                    'user-edit-form-field-phone',
                    'user-edit-form-field-mobile',
                    'user-edit-form-field-email',
                    'user-edit-form-field-comment',
                    'user-edit-form-field-valid',
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-roles',
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'user-edit-form-group-roles', 'Translatable#Role Assignment', ['user-edit-form-field-roles']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-language',
                'Translatable#Language', PersonalSettingsProperty.USER_LANGUAGE, 'language-input',
                true, 'Translatable#Helptext_Admin_UserCreate_Preferences_UserLanguage', null
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-queues',
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'user-edit-form-field-notifications',
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'user-edit-form-group-preferences', 'Translatable#Preferences',
                [
                    'user-edit-form-field-language',
                    'user-edit-form-field-queues',
                    'user-edit-form-field-notifications'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'user-edit-form-group-page', 'Translatable#Edit Agent',
                [
                    'user-edit-form-group-informations',
                    'user-edit-form-group-roles',
                    'user-edit-form-group-preferences'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Agent',
                ['user-edit-form-group-page'],
                KIXObjectType.USER, true, FormContext.EDIT
            )
        );
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.USER, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
