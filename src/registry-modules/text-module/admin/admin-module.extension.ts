import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'ticket', 'Translatable#Ticket', null, [], [
                    new AdminModule(
                        null, 'text-modules', 'Translatable#Text Modules', null,
                        KIXObjectType.TEXT_MODULE, 'ticket-admin-text-modules'
                    )
                ]
            )
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
