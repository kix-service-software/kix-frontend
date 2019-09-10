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
                null, 'communication', 'Translatable#Communication', null, [
                    new AdminModuleCategory(
                        null, 'communication_email', 'Translatable#Email', null, [], [
                            new AdminModule(
                                null, 'system-address', 'Translatable#Email Addresses', null,
                                KIXObjectType.SYSTEM_ADDRESS, 'communication-admin-system-addresses', [
                                    new UIComponentPermission(
                                        'system/communication/systemaddresses', [CRUD.CREATE], true
                                    ),
                                    new UIComponentPermission(
                                        'system/communication/systemaddresses/*', [CRUD.UPDATE], true
                                    )
                                ]
                            ),
                            new AdminModule(
                                null, 'mail-account', 'Translatable#Email Accounts', null,
                                KIXObjectType.MAIL_ACCOUNT, 'communication-admin-mail-accounts', [
                                    new UIComponentPermission(
                                        'system/communication/mailaccounts', [CRUD.CREATE], true
                                    ),
                                    new UIComponentPermission(
                                        'system/communication/mailaccounts/*', [CRUD.UPDATE], true
                                    )
                                ]
                            ),
                            new AdminModule(
                                null, 'mail-filter', 'Translatable#Email Filter', null,
                                KIXObjectType.MAIL_FILTER, 'communication-admin-mail-filters', [
                                    new UIComponentPermission(
                                        'system/communication/mailfilters', [CRUD.CREATE], true
                                    ),
                                    new UIComponentPermission(
                                        'system/communication/mailfilters/*', [CRUD.UPDATE], true
                                    )
                                ]
                            )
                        ]
                    )
                ],
                [
                    new AdminModule(
                        null, 'webforms', 'Translatable#Webform', null,
                        KIXObjectType.WEBFORM, 'communication-admin-webforms', [
                            new UIComponentPermission('system/ticket/types', [CRUD.READ], true),
                            new UIComponentPermission('system/ticket/states', [CRUD.READ], true),
                            new UIComponentPermission('system/ticket/priorities', [CRUD.READ], true),
                            new UIComponentPermission('system/ticket/queues', [CRUD.READ], true)
                        ]
                    ),
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
