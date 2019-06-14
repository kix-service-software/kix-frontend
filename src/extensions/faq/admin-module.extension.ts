import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'knowledge-database', 'Translatable#Knowledge Database', null, [], [
                    new AdminModule(
                        null, 'faq-categories', 'Translatable#FAQ Categories', null,
                        KIXObjectType.FAQ_CATEGORY, 'faq-admin-categories', [
                            new UIComponentPermission('system/faq/categories', [CRUD.CREATE], true),
                            new UIComponentPermission('system/faq/categories/*', [CRUD.UPDATE], true)
                        ]
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
