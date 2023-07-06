/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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

    public permissions: UIComponentPermission[] = [];

    public orderRang: number = 1000;
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
