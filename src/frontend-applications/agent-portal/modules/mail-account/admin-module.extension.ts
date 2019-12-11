/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
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
                null, 'communication', 'Translatable#Communication', null,
                [
                    new AdminModuleCategory(
                        null, 'communication_email', 'Translatable#Email', null, [],
                        [
                            new AdminModule(
                                null, 'mail-account', 'Translatable#Email Accounts', null,
                                KIXObjectType.MAIL_ACCOUNT, 'admin-mail-accounts', [
                                new UIComponentPermission(
                                    'system/communication/mailaccounts', [CRUD.CREATE], true
                                ),
                                new UIComponentPermission(
                                    'system/communication/mailaccounts/*', [CRUD.UPDATE], true
                                )
                            ]
                            )
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