import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../../core/model";
import { UIComponentPermission } from "../../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'ticket', 'Translatable#Ticket', null, [], [
                    new AdminModule(
                        null, 'ticket-types', 'Translatable#Types', null,
                        KIXObjectType.TICKET_TYPE, 'ticket-admin-types',
                        [
                            new UIComponentPermission('tickettypes', [CRUD.CREATE], true),
                            new UIComponentPermission('tickettypes/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'ticket-priorities', 'Translatable#Priorities', null,
                        KIXObjectType.TICKET_PRIORITY, 'ticket-admin-priorities',
                        [
                            new UIComponentPermission('priorities', [CRUD.CREATE], true),
                            new UIComponentPermission('priorities/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'ticket-states', 'Translatable#States', null,
                        KIXObjectType.TICKET_STATE, 'ticket-admin-states',
                        [
                            new UIComponentPermission('ticketstates', [CRUD.CREATE], true),
                            new UIComponentPermission('ticketstates/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'queues', 'Translatable#Queues', null,
                        KIXObjectType.QUEUE, 'ticket-admin-queues',
                        [
                            new UIComponentPermission('queues', [CRUD.CREATE], true),
                            new UIComponentPermission('queues/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    // TODO: wieder aktivieren mit KIX2018-1865
                    // new AdminModule(
                    //     null, 'ticket-templates', 'Translatable#Templates', null,
                    //     KIXObjectType.TICKET_TEMPLATE, 'ticket-admin-templates'
                    // )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
