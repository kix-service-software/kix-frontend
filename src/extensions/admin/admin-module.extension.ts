import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'system', 'Translatable#System', null, [], [
                    new AdminModule(
                        null, 'sysconfig', 'Translatable#SysConfig', null,
                        KIXObjectType.SYS_CONFIG_OPTION, 'system-admin-sysconfig',
                        [
                            new UIComponentPermission('system/config', [CRUD.CREATE], true),
                            new UIComponentPermission('system/config/*', [CRUD.UPDATE], true)
                        ]
                    )
                ]
            ),
            new AdminModuleCategory(
                null, 'automation', 'Translatable#Automation', null, [], [
                    new AdminModule(
                        null, 'notifications', 'Translatable#Notifications', null,
                        KIXObjectType.NOTIFICATION, 'admin-notifications',
                        [
                            new UIComponentPermission('system/communication/notifications', [CRUD.CREATE], true),
                            new UIComponentPermission('system/communication/notifications/*', [CRUD.UPDATE], true)
                        ]
                    )
                ]
            )
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
