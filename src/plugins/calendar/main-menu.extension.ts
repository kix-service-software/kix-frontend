/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../frontend-applications/agent-portal/server/extensions/IMainMenuExtension';
import { UIComponentPermission } from '../../frontend-applications/agent-portal/model/UIComponentPermission';
import { CalendarContext } from './webapp/core';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = CalendarContext.CONTEXT_ID;

    public contextIds: string[] = [CalendarContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-calendar";

    public text: string = "Translatable#Calendar";

    public permissions: UIComponentPermission[] = [];

    public orderRang: number = 800;

}

module.exports = (data, host, options) => {
    return new Extension();
};
