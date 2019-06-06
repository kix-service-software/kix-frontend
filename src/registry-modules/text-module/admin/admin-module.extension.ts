import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../../core/model";
import { UIComponentPermission } from "../../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'ticket', 'Translatable#Ticket', null, [], [
                    new AdminModule(
                        null, 'text-modules', 'Translatable#Text Modules', null,
                        KIXObjectType.TEXT_MODULE, 'ticket-admin-text-modules', [
                            new UIComponentPermission('textmodules', [CRUD.CREATE], true),
                            new UIComponentPermission('textmodules/*', [CRUD.UPDATE], true)
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
