import {
    IPersonalSettingsExtension, PersonalSetting, FormFieldOption, ObjectReferenceOptions,
    KIXObjectType, PersonalSettingsProperty
} from "../../core/model";

class Extension implements IPersonalSettingsExtension {

    public getPersonalSettings(): PersonalSetting[] {
        return [
            new PersonalSetting(
                'Translatable#Localisation',
                PersonalSettingsProperty.USER_LANGUAGE,
                'Translatable#Language',
                // tslint:disable-next-line:max-line-length
                'Translatable#Helptext_PersonalSettings_UserLanguage_Hint',
                'language-input'
            ),
            new PersonalSetting(
                'Translatable#Favorites',
                PersonalSettingsProperty.MY_QUEUES,
                'Translatable#My Queues',
                'Translatable#Helptext_PersonalSettings_MyQueues_Hint',
                'object-reference-input',
                null,
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
                ]
            )
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
