/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IPersonalSettingsExtension, PersonalSetting, FormFieldOption, ObjectReferenceOptions,
    KIXObjectType, PersonalSettingsProperty, KIXObjectLoadingOptions, KIXObjectProperty,
    FilterCriteria, FilterType, FilterDataType, QueueProperty, FormFieldOptions, InputFieldTypes, NotificationProperty
} from "../../core/model";
import { SearchOperator } from "../../core/browser";

class Extension implements IPersonalSettingsExtension {

    public getPersonalSettings(): PersonalSetting[] {
        return [
            new PersonalSetting(
                'Translatable#Change Password',
                PersonalSettingsProperty.CURRENT_PASSWORD,
                'Translatable#Current Password',
                'Translatable#Helptext_PersonalSettings_UserPassword_Hint',
                null, null, null,
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            ),
            new PersonalSetting(
                'Translatable#Change Password',
                PersonalSettingsProperty.USER_PASSWORD,
                'Translatable#New Password',
                'Translatable#Helptext_PersonalSettings_UserNewPassword_Hint',
                null, null, null,
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            ),
            new PersonalSetting(
                'Translatable#Change Password',
                PersonalSettingsProperty.USER_PASSWORD_CONFIRM,
                'Translatable#Confirm New Password',
                'Translatable#Helptext_PersonalSettings_UserNewPasswordConfirm_Hint',
                null, null, null,
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            ),
            new PersonalSetting(
                'Translatable#Localisation',
                PersonalSettingsProperty.USER_LANGUAGE,
                'Translatable#Language',
                'Translatable#Helptext_PersonalSettings_UserLanguage_Hint',
                'language-input', true
            ),
            new PersonalSetting(
                'Translatable#Favorites',
                PersonalSettingsProperty.MY_QUEUES,
                'Translatable#My Queues',
                'Translatable#Helptext_PersonalSettings_MyQueues_Hint',
                'object-reference-input',
                null, null,
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
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
            ),
            new PersonalSetting(
                'Translatable#Notifications',
                PersonalSettingsProperty.NOTIFICATIONS,
                'Translatable#For Tickets',
                'Translatable#Helptext_PersonalSettings_Notifications_Hint',
                'object-reference-input',
                null, null,
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.NOTIFICATION),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
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
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
