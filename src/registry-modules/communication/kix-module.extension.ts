import { IKIXModuleExtension } from "../../core/extensions";

class KIXModuleExtension implements IKIXModuleExtension {

    public initComponentId: string = 'communication-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['communication-module-component', 'communication/communication-module-component'],
        ['communication-admin-system-addresses', 'communication/admin/communication-admin-system-addresses'],
        ['system-address-info-widget', 'communication/admin/widgets/system-address-info-widget'],
        ['system-address-assigned-queues-widget', 'communication/admin/widgets/system-address-assigned-queues-widget'],
        ['new-system-address-dialog', 'communication/admin/dialogs/new-system-address-dialog'],
        ['edit-system-address-dialog', 'communication/admin/dialogs/edit-system-address-dialog'],
        ['communication-admin-mail-accounts', 'communication/admin/communication-admin-mail-accounts'],
        ['new-mail-account-dialog', 'communication/admin/dialogs/new-mail-account-dialog'],
        ['mail-account-input-dispatching', 'communication/admin/dialogs/inputs/mail-account-input-dispatching'],
        ['mail-account-input-types', 'communication/admin/dialogs/inputs/mail-account-input-types']
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtension();
};
