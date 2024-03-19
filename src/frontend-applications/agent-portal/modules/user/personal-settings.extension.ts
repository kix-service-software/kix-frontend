/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPersonalSettingsExtension } from '../../server/extensions/IPersonalSettingsExtension';
import { PersonalSetting } from './model/PersonalSetting';
import { PersonalSettingsProperty } from './model/PersonalSettingsProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../modules/base-components/webapp/core/InputFieldTypes';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { NotificationProperty } from '../notification/model/NotificationProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { DefaultSelectInputFormOption } from '../../model/configuration/DefaultSelectInputFormOption';
import { TreeNode } from '../base-components/webapp/core/tree';

class Extension extends KIXExtension implements IPersonalSettingsExtension {

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

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                    new FormFieldOption(
                        ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [], null, null, null, null,
                            [
                                [
                                    'requiredPermission',
                                    JSON.stringify({
                                        Object: KIXObjectType.USER,
                                        ObjectID: KIXObjectType.CURRENT_USER,
                                        Permission: 'WRITE,READ'
                                    })
                                ]
                            ]
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

                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
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
            ),
            new PersonalSetting(
                'Translatable#Notifications',
                PersonalSettingsProperty.DONT_ASK_DIALOG_ON_CLOSE,
                'Translatable#Always close dialog tab without asking',
                'Translatable#Helptext_PersonalSettings_Always_close_dialog_tab_without_asking_Hint',
                'checkbox-input'
            ),
            new PersonalSetting(
                'Translatable#User Token',
                PersonalSettingsProperty.USER_TOKEN,
                'Translatable#User Token',
                'Translatable#Helptext_PersonalSettings_user_token_Hint',
                'user-token-input'
            ),
            new PersonalSetting(
                'Translatable#Article',
                PersonalSettingsProperty.ARTICLE_SORT_ORDER,
                'Translatable#Article sort order',
                'Translatable#Helptext_PersonalSettings_article_sort_order_Hint',
                'default-select-input',
                false, new FormFieldValue('oldest'),
                [
                    new FormFieldOption(DefaultSelectInputFormOption.NODES,
                        [
                            new TreeNode('oldest', 'Translatable#Oldest first'),
                            new TreeNode('newest', 'Translatable#Newest first')
                        ]
                    )
                ]
            ),
            new PersonalSetting(
                'Translatable#Article',
                PersonalSettingsProperty.ARTICLE_FROM_FORMAT,
                'Translatable#From format',
                'Translatable#Helptext_PersonalSettings_article_from_format',
                'default-select-input',
                false, new FormFieldValue('SystemAddress'),
                [
                    new FormFieldOption(DefaultSelectInputFormOption.NODES,
                        [
                            new TreeNode('SystemAddress', 'Translatable#Sender Address'),
                            new TreeNode('Agent', '<KIX_CURRENT_Firstname> <KIX_CURRENT_Lastname>'),
                            new TreeNode('AgentViaSystemAddress', 'Translatable#<KIX_CURRENT_Firstname> <KIX_CURRENT_Lastname> via Sender Address')
                        ]
                    )
                ]
            )
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
