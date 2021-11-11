/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../server/extensions/IMainMenuExtension';
import { OrganisationContext, OrganisationDetailsContext, ContactDetailsContext } from './webapp/core';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IMainMenuExtension {

    public mainContextId: string = OrganisationContext.CONTEXT_ID;

    public contextIds: string[] = [
        OrganisationContext.CONTEXT_ID, OrganisationDetailsContext.CONTEXT_ID, ContactDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = true;

    public icon: string = 'kix-icon-organisation';

    public text: string = 'Translatable#Organisations';

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('organisations', [CRUD.READ]),
        new UIComponentPermission('contacts', [CRUD.READ], true)
    ];

    public orderRang: number = 300;

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
