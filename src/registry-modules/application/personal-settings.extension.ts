import { IPersonalSettingsExtension, PersonalSetting } from "../../core/model";

class Extension implements IPersonalSettingsExtension {

    public getPersonalSettings(): PersonalSetting[] {
        return [
            new PersonalSetting(
                'Lokalisierung',
                'UserLanguage',
                'Sprache',
                // tslint:disable-next-line:max-line-length
                'Bitte wählen Sie die Sprache, in der Sie KIX benutzen wollen. Ist nichts gesetzt, versucht das System die Sprache automatisch zu wählen.',
                'language-input'
            )
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
