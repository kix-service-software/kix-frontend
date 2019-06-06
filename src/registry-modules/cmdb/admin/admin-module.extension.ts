import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../../core/model";
import { UIComponentPermission } from "../../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'cmdb', 'Translatable#CMDB', null, [], [
                    new AdminModule(
                        null, 'cmdb-classes', 'Translatable#CI Classes', null,
                        KIXObjectType.CONFIG_ITEM_CLASS, 'cmdb-admin-ci-classes', [
                            new UIComponentPermission('cmdb/classes', [CRUD.CREATE]),
                            new UIComponentPermission('cmdb/classes/*', [CRUD.UPDATE])
                        ]
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
