/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../server/extensions/IMainMenuExtension';
import { HomeContext } from './webapp/core';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IMainMenuExtension {

    public mainContextId: string = HomeContext.CONTEXT_ID;

    public contextIds: string[] = [HomeContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = 'kix-icon-home';

    public text: string = 'Translatable#Home';

    public permissions: UIComponentPermission[] = [];

    public orderRang: number = 0;

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
