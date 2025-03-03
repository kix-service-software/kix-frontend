/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
                null, 'kix', 'Translatable#KIX', null, null, null, [], 0, [
                new AdminModule(
                    null, 'automation', 'Translatable#Automation', null, null, null, [], 0,
                    [
                        new AdminModule(
                            null, 'notifications', 'Translatable#Notifications', null,
                            KIXObjectType.NOTIFICATION, 'admin-notifications',
                            [
                                new UIComponentPermission('system/communication/notifications', [CRUD.CREATE], true)
                            ]
                        ),
                        new AdminModule(
                            null, 'notification-template', 'Translatable#Notification Template', null,
                            KIXObjectType.ANY, 'setup-notification-template',
                            [
                                new UIComponentPermission(
                                    'system/config/Notification::Template', [CRUD.UPDATE],
                                    true, null, false
                                )
                            ]
                        )
                    ], true
                )
            ], true)
        ];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
