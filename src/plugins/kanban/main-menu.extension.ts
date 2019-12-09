/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KanbanContext } from './webapp/core';
import { IMainMenuExtension } from '../../frontend-applications/agent-portal/server/extensions/IMainMenuExtension';
import { UIComponentPermission } from '../../frontend-applications/agent-portal/model/UIComponentPermission';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = KanbanContext.CONTEXT_ID;

    public contextIds: string[] = [KanbanContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-kanban";

    public text: string = "Translatable#Kanban";

    public permissions: UIComponentPermission[] = [];

    public orderRang: number = 800;

}

module.exports = (data, host, options) => {
    return new Extension();
};
