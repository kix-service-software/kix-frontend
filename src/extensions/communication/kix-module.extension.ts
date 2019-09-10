/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class KIXModuleExtension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'communication-module-component',
            'core/browser/modules/ui-modules/CommunicationUIModule',
            []
        )
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
        new UIComponent('edit-mail-account-dialog', 'communication/admin/dialogs/edit-mail-account-dialog', []),
        new UIComponent('communication-admin-mail-filters', 'communication/admin/communication-admin-mail-filters', []),
        new UIComponent('new-mail-filter-dialog', 'communication/admin/dialogs/new-mail-filter-dialog', []),
        new UIComponent(
            'mail-filter-match-form-input', 'communication/admin/dialogs/inputs/mail-filter-match-form-input', []
        ),
        new UIComponent('mail-filter-match-input', 'communication/admin/dialogs/inputs/mail-filter-match-input', []),
        new UIComponent(
            'mail-filter-set-form-input', 'communication/admin/dialogs/inputs/mail-filter-set-form-input', []
        ),
        new UIComponent('edit-sysconfig-dialog', 'system/admin/dialogs/edit-sysconfig-dialog', []),

        new UIComponent('edit-mail-filter-dialog', 'communication/admin/dialogs/edit-mail-filter-dialog', []),
        new UIComponent('communication-admin-webforms', 'communication/admin/communication-admin-webforms', []),
        new UIComponent('new-webform-dialog', 'communication/admin/dialogs/new-webform-dialog', []),
        new UIComponent('webform-code-widget', 'communication/admin/widgets/webform-code-widget', []),
        new UIComponent('webform-code-content', 'communication/admin/webform-code-content', []),
        new UIComponent('edit-webform-dialog', 'communication/admin/dialogs/edit-webform-dialog', [])
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtension();
};
