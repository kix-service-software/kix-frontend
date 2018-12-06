import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "@kix/core/dist/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'base-data', 'Stammdaten', null, [], [
                    new AdminModule(
                        null, 'ticket-types', 'Typen', null, KIXObjectType.TICKET_TYPE, 'ticket-admin-types'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
