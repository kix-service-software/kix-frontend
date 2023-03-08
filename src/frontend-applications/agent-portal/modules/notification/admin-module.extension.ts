/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension } from '../admin/server/IAdminModuleExtension';
import { AdminModuleCategory } from '../admin/model/AdminModuleCategory';
import { AdminModule } from '../admin/model/AdminModule';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'kix', 'Translatable#KIX', null, [
                new AdminModuleCategory(
                    null, 'automation', 'Translatable#Automation', null, [],
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
                    ]
                )
            ])
        ];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
