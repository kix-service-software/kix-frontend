import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'i18n', 'Translatable#Internationalisation', null, [], [
                    new AdminModule(
                        null, 'translations', 'Translatable#Translations', null,
                        KIXObjectType.TRANSLATION, 'i18n-admin-translations', [
                            new UIComponentPermission('system/i18n/translations', [CRUD.CREATE], true),
                            new UIComponentPermission('system/i18n/translations/*', [CRUD.UPDATE], true)
                        ]
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
