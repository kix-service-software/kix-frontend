/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension } from "../admin/server/IAdminModuleExtension";
import { AdminModuleCategory } from "../admin/model/AdminModuleCategory";
import { AdminModule } from "../admin/model/AdminModule";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { CRUD } from "../../../../server/model/rest/CRUD";

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
