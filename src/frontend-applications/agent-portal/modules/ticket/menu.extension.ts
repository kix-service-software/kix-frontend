/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../server/extensions/IMainMenuExtension';
import { TicketContext, TicketDetailsContext } from './webapp/core';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IMainMenuExtension {

    public mainContextId: string = TicketContext.CONTEXT_ID;

    public contextIds: string[] = [TicketContext.CONTEXT_ID, TicketDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = 'kix-icon-ticket';

    public text: string = 'Translatable#Tickets';

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('tickets', [CRUD.READ])
    ];

    public orderRang: number = 100;

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
