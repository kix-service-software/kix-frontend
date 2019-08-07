/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../core/extensions';
import { ContactDetailsContext } from '../../core/browser/contact';
import { OrganisationContext, OrganisationDetailsContext } from '../../core/browser/organisation';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { CRUD } from '../../core/model';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = OrganisationContext.CONTEXT_ID;

    public contextIds: string[] = [
        OrganisationContext.CONTEXT_ID, OrganisationDetailsContext.CONTEXT_ID, ContactDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-organisation";

    public text: string = "Translatable#Customer";

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('organisations', [CRUD.READ]),
        new UIComponentPermission('contacts', [CRUD.READ], true)
    ];

    public orderRang: number = 300;

}

module.exports = (data, host, options) => {
    return new Extension();
};
