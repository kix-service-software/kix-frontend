import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'i18n', 'Translatable#Internationalization', null, [], [
                    new AdminModule(
                        null, 'translations', 'Translatable#Translations', null,
                        KIXObjectType.TRANSLATION, 'i18n-admin-translations'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
