import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'communication', 'Translatable#Communication', null, [
                    new AdminModuleCategory(
                        null, 'communication_email', 'Translatable#Email', null, [], [
                            new AdminModule(
                                null, 'system-address', 'Translatable#Email Addresses', null,
                                KIXObjectType.SYSTEM_ADDRESS, 'communication-admin-system-addresses'
                            ),
                            new AdminModule(
                                null, 'mail-account', 'Translatable#Email Accounts', null,
                                KIXObjectType.MAIL_ACCOUNT, 'communication-admin-mail-accounts'
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