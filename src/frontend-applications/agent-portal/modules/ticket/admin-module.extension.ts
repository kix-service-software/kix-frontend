/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension } from '../admin/server/IAdminModuleExtension';
import { AdminModule } from '../admin/model/AdminModule';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IAdminModuleExtension {

    public getAdminModules(): AdminModule[] {
        return [
            new AdminModule(
                null, 'kix', 'Translatable#KIX', null, null, null, [], 0,
                [
                    new AdminModule(
                        null, 'ticket', 'Translatable#Ticket', null, null, null, [], 0,
                        [
                            new AdminModule(
                                null, 'ticket-types', 'Translatable#Types', null,
                                KIXObjectType.TICKET_TYPE, 'ticket-admin-types',
                                [
                                    new UIComponentPermission('system/ticket/types', [CRUD.CREATE], true)
                                ]
                            ),
                            new AdminModule(
                                null, 'ticket-priorities', 'Translatable#Priorities', null,
                                KIXObjectType.TICKET_PRIORITY, 'ticket-admin-priorities',
                                [
                                    new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE], true)
                                ]
                            ),
                            new AdminModule(
                                null, 'ticket-states', 'Translatable#States', null,
                                KIXObjectType.TICKET_STATE, 'ticket-admin-states',
                                [
                                    new UIComponentPermission('system/ticket/states', [CRUD.CREATE], true)
                                ]
                            ),
                            new AdminModule(
                                null, 'queues', 'Translatable#Queues', null,
                                KIXObjectType.QUEUE, 'ticket-admin-queues',
                                [
                                    new UIComponentPermission('system/ticket/queues', [CRUD.CREATE], true)
                                ]
                            )
                        ], true
                    )
                ], true
            )
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
