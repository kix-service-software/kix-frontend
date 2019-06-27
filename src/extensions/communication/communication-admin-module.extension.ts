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
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
