import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'ticket', 'Translatable#Ticket', null, [], [
                    new AdminModule(
                        null, 'ticket-types', 'Translatable#Types', null,
                        KIXObjectType.TICKET_TYPE, 'ticket-admin-types',
                        [
                            new UIComponentPermission('system/ticket/types', [CRUD.CREATE], true),
                            new UIComponentPermission('system/ticket/types/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'ticket-priorities', 'Translatable#Priorities', null,
                        KIXObjectType.TICKET_PRIORITY, 'ticket-admin-priorities',
                        [
                            new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE], true),
                            new UIComponentPermission('system/ticket/priorities/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'ticket-states', 'Translatable#States', null,
                        KIXObjectType.TICKET_STATE, 'ticket-admin-states',
                        [
                            new UIComponentPermission('system/ticket/states', [CRUD.CREATE], true),
                            new UIComponentPermission('system/ticket/states/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'queues', 'Translatable#Queues', null,
                        KIXObjectType.QUEUE, 'ticket-admin-queues',
                        [
                            new UIComponentPermission('system/ticket/queues', [CRUD.CREATE], true),
                            new UIComponentPermission('system/ticket/queues/*', [CRUD.UPDATE], true)
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
