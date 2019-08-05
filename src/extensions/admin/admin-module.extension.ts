/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'system', 'Translatable#System', null, [], [
                    new AdminModule(
                        null, 'sysconfig', 'Translatable#SysConfig', null,
                        KIXObjectType.SYS_CONFIG_OPTION, 'system-admin-sysconfig',
                        [
                            new UIComponentPermission('system/config', [CRUD.CREATE], true),
                            new UIComponentPermission('system/config/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'logs', 'Translatable#Logs', null,
                        KIXObjectType.LOG_FILE, 'system-admin-logs',
                        [
                            new UIComponentPermission('system/logs', [CRUD.READ])
                        ]
                    ),
                    new AdminModule(
                        null, 'console', 'Translatable#Console', null,
                        KIXObjectType.CONSOLE_COMMAND, 'system-admin-console',
                        [
                            new UIComponentPermission('system/console', [CRUD.READ, CRUD.CREATE])
                        ]
                    )
                ]
            ),
            new AdminModuleCategory(
                null, 'automation', 'Translatable#Automation', null, [], [
                    new AdminModule(
                        null, 'notifications', 'Translatable#Notifications', null,
                        KIXObjectType.NOTIFICATION, 'admin-notifications',
                        [
                            new UIComponentPermission('system/communication/notifications', [CRUD.CREATE], true),
                            new UIComponentPermission('system/communication/notifications/*', [CRUD.UPDATE], true)
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
