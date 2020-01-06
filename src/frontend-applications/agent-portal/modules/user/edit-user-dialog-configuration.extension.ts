/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { EditUserDialogContext } from "./webapp/core/admin";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ConfiguredDialogWidget } from "../../model/configuration/ConfiguredDialogWidget";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { ContextMode } from "../../model/ContextMode";
import { ConfigurationService } from "../../../../server/services/ConfigurationService";
import { FormFieldConfiguration } from "../../model/configuration/FormFieldConfiguration";
import { UserProperty } from "./model/UserProperty";
import { FormFieldOption } from "../../model/configuration/FormFieldOption";
import { FormFieldOptions } from "../../model/configuration/FormFieldOptions";
import { InputFieldTypes } from "../../modules/base-components/webapp/core/InputFieldTypes";
import { KIXObjectProperty } from "../../model/kix/KIXObjectProperty";
import { ObjectReferenceOptions } from "../../modules/base-components/webapp/core/ObjectReferenceOptions";
import { FormFieldValue } from "../../model/configuration/FormFieldValue";
import { FormGroupConfiguration } from "../../model/configuration/FormGroupConfiguration";
import { KIXObjectLoadingOptions } from "../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../model/FilterCriteria";
import { RoleProperty } from "./model/RoleProperty";
import { SearchOperator } from "../search/model/SearchOperator";
import { FilterDataType } from "../../model/FilterDataType";
import { FilterType } from "../../model/FilterType";
import { PersonalSettingsProperty } from "./model/PersonalSettingsProperty";
import { FormPageConfiguration } from "../../model/configuration/FormPageConfiguration";
import { FormConfiguration } from "../../model/configuration/FormConfiguration";
import { FormContext } from "../../model/configuration/FormContext";
import { ModuleConfigurationService } from "../../server/services/configuration";
import { NotificationProperty } from "../notification/model/NotificationProperty";


export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditUserDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'user-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-user-dialog', 'Translatable#Edit Agent', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Edit User Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'user-edit-dialog-widget', 'user-edit-dialog-widget',
                        KIXObjectType.USER, ContextMode.EDIT_ADMIN
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const configurationService = ConfigurationService.getInstance();

        const formId = 'user-edit-form';
        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-title',
                'Translatable#Title', UserProperty.USER_TITLE, null, false,
                'Translatable#Helptext_Admin_Users_UserEdit_Title'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-firstname',
                'Translatable#First Name', UserProperty.USER_FIRSTNAME, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_FirstName'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-lastname',
                'Translatable#Last Name', UserProperty.USER_LASTNAME, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_LastName'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-login',
                'Translatable#Login Name', UserProperty.USER_LOGIN, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_Login'
            )
        );

        configurations.push(
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

        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-phone',
                'Translatable#Phone', UserProperty.USER_PHONE, null, false,
                'Translatable#Helptext_Admin_Users_UserEdit_Phone'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-mobile',
                'Translatable#Mobile', UserProperty.USER_MOBILE, null, false,
                'Translatable#Helptext_Admin_Users_UserEdit_Mobile'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-email',
                'Translatable#Email', UserProperty.USER_EMAIL, null, true,
                'Translatable#Helptext_Admin_Users_UserEdit_Email'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-comment',
                'Translatable#Comment', UserProperty.USER_COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_Users_UserEdit_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_Users_UserEdit_Valid', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
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

        configurations.push(
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

        configurations.push(
            new FormGroupConfiguration(
                'user-edit-form-group-roles', 'Translatable#Role Assignment', ['user-edit-form-field-roles']
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'user-edit-form-field-language',
                'Translatable#Language', PersonalSettingsProperty.USER_LANGUAGE, 'language-input',
                true, 'Translatable#Helptext_Admin_UserCreate_Preferences_UserLanguage', null
            )
        );

        configurations.push(
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
                                    'ParentID', SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ], undefined, undefined, ['SubQueues'], ['SubQueues']
                        )
                    )
                ]
            )
        );

        configurations.push(
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

        configurations.push(
            new FormGroupConfiguration(
                'user-edit-form-group-preferences', 'Translatable#Preferences',
                [
                    'user-edit-form-field-language',
                    'user-edit-form-field-queues',
                    'user-edit-form-field-notifications'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'user-edit-form-group-page', 'Translatable#Edit Agent',
                [
                    'user-edit-form-group-informations',
                    'user-edit-form-group-roles',
                    'user-edit-form-group-preferences'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Agent',
                ['user-edit-form-group-page'],
                KIXObjectType.USER, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.USER, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
