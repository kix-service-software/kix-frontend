import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "@kix/core/dist/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'base-data', 'Stammdaten', null, [], [
                    new AdminModule(
                        null, 'ticket-types', 'Typen', null, KIXObjectType.TICKET_TYPE, 'ticket-admin-types'
                    ),
                    new AdminModule(
                        null, 'ticket-priorities', 'Prioritäten', null,
                        KIXObjectType.TICKET_PRIORITY, 'ticket-admin-priorities'
                    ),
                    new AdminModule(
                        null, 'ticket-states', 'Status', null, KIXObjectType.TICKET_STATE, 'ticket-admin-states'
                    )
                ]),
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
