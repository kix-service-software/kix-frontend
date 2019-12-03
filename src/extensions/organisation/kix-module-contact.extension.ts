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
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public id: string = 'contact-module';

    public tags: Array<[string, string]>;

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('contact-read-module-component', 'core/browser/modules/ui-modules/ContactReadUIModule', [
            new UIComponentPermission('contacts', [CRUD.READ])
        ]),
        new UIComponent('contact-edit-module-component', 'core/browser/modules/ui-modules/ContactEditUIModule', [
            new UIComponentPermission('contacts', [CRUD.CREATE]),
            new UIComponentPermission('contacts/*', [CRUD.UPDATE])
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'contact-assigned-organisations-widget', 'organisation/widgets/contact-assigned-organisations-widget', []
        ),
        new UIComponent('contact-assigned-tickets-widget', 'organisation/widgets/contact-assigned-tickets-widget', []),
        new UIComponent('new-contact-dialog', 'organisation/dialogs/new-contact-dialog', []),
        new UIComponent('edit-contact-dialog', 'organisation/dialogs/edit-contact-dialog', []),
        new UIComponent('search-contact-dialog', 'organisation/dialogs/search-contact-dialog', []),
        new UIComponent('contact-input-organisation', 'organisation/dialogs/inputs/contact-input-organisation', []),
        new UIComponent('create-new-ticket-cell', 'organisation/table/create-new-ticket-cell', []),
        new UIComponent('contact-list-widget', 'organisation/widgets/contact-list-widget', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
