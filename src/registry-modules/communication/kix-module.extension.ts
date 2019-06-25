import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class KIXModuleExtension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public initComponents: UIComponent[] = [
        new UIComponent('communication-module-component', 'communication/communication-module-component', [])
    ];

    public id = 'communication-module';

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'communication-admin-system-addresses', 'communication/admin/communication-admin-system-addresses', []
        ),
        new UIComponent('system-address-info-widget', 'communication/admin/widgets/system-address-info-widget', []),
        new UIComponent(
            'system-address-assigned-queues-widget',
            'communication/admin/widgets/system-address-assigned-queues-widget',
            []
        ),
        new UIComponent('new-system-address-dialog', 'communication/admin/dialogs/new-system-address-dialog', []),
        new UIComponent('edit-system-address-dialog', 'communication/admin/dialogs/edit-system-address-dialog', []),
        new UIComponent(
            'communication-admin-mail-accounts', 'communication/admin/communication-admin-mail-accounts', []
        ),
        new UIComponent('new-mail-account-dialog', 'communication/admin/dialogs/new-mail-account-dialog', []),
        new UIComponent(
            'mail-account-input-dispatching', 'communication/admin/dialogs/inputs/mail-account-input-dispatching', []
        ),
        new UIComponent('mail-account-input-types', 'communication/admin/dialogs/inputs/mail-account-input-types', []),
        new UIComponent('mail-account-info-widget', 'communication/admin/widgets/mail-account-info-widget', []),
        new UIComponent('edit-mail-account-dialog', 'communication/admin/dialogs/edit-mail-account-dialog', [])
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtension();
};
