import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'system', 'Translatable#System', null, [
                    new AdminModuleCategory(
                        null, 'system_sysconfig', 'Translatable#SysConfig', null, [], [
                            new AdminModule(
                                null, 'sysconfig', 'Translatable#', null,
                                KIXObjectType.SYS_CONFIG_ITEM, 'system-admin-sysconfig'
                            ),
                        ]
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
