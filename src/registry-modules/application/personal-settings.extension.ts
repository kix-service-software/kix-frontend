import { IPersonalSettingsExtension, PersonalSetting } from "../../core/model";

class Extension implements IPersonalSettingsExtension {

    public getPersonalSettings(): PersonalSetting[] {
        return [
            new PersonalSetting(
                'Translatable#Localisation',
                'UserLanguage',
                'Language',
                // tslint:disable-next-line:max-line-length
                'Translatable#Please select the language in which you want to use KIX. If not set, the system will try to choose the language automatically',
                'language-input'
            )
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
