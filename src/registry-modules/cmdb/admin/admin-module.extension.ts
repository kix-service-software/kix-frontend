import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'base-data', 'Translatable#Core Data', null, [], [
                    new AdminModule(
                        null, 'cmdb-classes', 'Translatable#CI Classes', null,
                        KIXObjectType.CONFIG_ITEM_CLASS, 'cmdb-admin-ci-classes'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
