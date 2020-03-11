/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from "../../server/extensions/IMainMenuExtension";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { AdminContext } from "./webapp/core/AdminContext";

export class Extension implements IMainMenuExtension {

    public mainContextId: string = AdminContext.CONTEXT_ID;

    public contextIds: string[] = [
        AdminContext.CONTEXT_ID,
        // TicketTypeDetailsContext.CONTEXT_ID,
        // TicketStateDetailsContext.CONTEXT_ID,
        // TicketPriorityDetailsContext.CONTEXT_ID,
        // ConfigItemClassDetailsContext.CONTEXT_ID,
        // TranslationDetailsContext.CONTEXT_ID,
        // TicketTypeDetailsContext.CONTEXT_ID,
        // TicketPriorityDetailsContext.CONTEXT_ID,
        // TicketStateDetailsContext.CONTEXT_ID,
        // ConfigItemClassDetailsContext.CONTEXT_ID,
        // RoleDetailsContext.CONTEXT_ID,
        // UserDetailsContext.CONTEXT_ID,
        // QueueDetailsContext.CONTEXT_ID,
        // SystemAddressDetailsContext.CONTEXT_ID,
        // FAQCategoryDetailsContext.CONTEXT_ID,
        // MailAccountDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = false;

    public icon: string = "kix-icon-admin";

    public text: string = "Translatable#Admin";

    public permissions: UIComponentPermission[] = [];

    public orderRang: number = 1000;
}

module.exports = (data, host, options) => {
    return new Extension();
};
