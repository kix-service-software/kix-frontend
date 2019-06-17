import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'system', 'Translatable#System', null, [], [
                    new AdminModule(
                        null, 'sysconfig', 'Translatable#SysConfig', null,
                        KIXObjectType.SYS_CONFIG_OPTION, 'system-admin-sysconfig'
                    )
                ]
            )
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
