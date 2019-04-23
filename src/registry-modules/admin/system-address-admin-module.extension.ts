import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'communication', 'Translatable#Communication', null, [], [
                    new AdminModule(
                        null, 'system-address', 'Translatable#E-mail-Addresses', null,
                        KIXObjectType.SYSTEM_ADDRESS, 'communication-admin-system-addresses'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
