/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../server/extensions/IMainMenuExtension';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { AdminContext } from './webapp/core/AdminContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { CRUD } from '../../../../server/model/rest/CRUD';

class Extension extends KIXExtension implements IMainMenuExtension {

    public mainContextId: string = AdminContext.CONTEXT_ID;

    public contextIds: string[] = [AdminContext.CONTEXT_ID];

    public primaryMenu: boolean = false;

    public icon: string = 'kix-icon-admin';

    public text: string = 'Translatable#Admin';

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/config/FQDN', [CRUD.UPDATE])
    ];

    public orderRang: number = 1000;
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
