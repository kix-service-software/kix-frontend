import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'knowledge-database', 'Translatable#Knowledge Database', null, [], [
                    new AdminModule(
                        null, 'faq-categories', 'Translatable#FAQ Categories', null,
                        KIXObjectType.FAQ_CATEGORY, 'faq-admin-catgeries'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
