import {
    IPersonalSettingsExtension, PersonalSetting, FormFieldOption, ObjectReferenceOptions,
    KIXObjectType, PersonalSettingsProperty, KIXObjectLoadingOptions, KIXObjectProperty,
    FilterCriteria, FilterType, FilterDataType
} from "../../core/model";
import { SearchOperator } from "../../core/browser";

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
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        ))
                ]
            )
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
