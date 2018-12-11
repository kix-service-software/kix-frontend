import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "@kix/core/dist/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'base-data', 'Stammdaten', null, [], [
                    new AdminModule(
                        null, 'cmdb-classes', 'CMDB Klassen', null,
                        KIXObjectType.CONFIG_ITEM_CLASS, 'cmdb-admin-ci-classes'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
