/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from "../context";
import { NewContactDialogContext, ContactDetailsContext, EditContactDialogContext } from "./context";
import { KIXObjectType, ContextMode } from "../../model";

export class ContactDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewContactDialogContext.CONTEXT_ID, KIXObjectType.CONTACT, ContextMode.CREATE
        );
    }

    public static async edit(contactid?: string | number): Promise<void> {
        if (!contactid) {
            const context = await ContextService.getInstance().getContext<ContactDetailsContext>(
                ContactDetailsContext.CONTEXT_ID
            );

            if (context) {
                contactid = context.getObjectId();
            }
        }

        if (contactid) {
            ContextService.getInstance().setDialogContext(
                EditContactDialogContext.CONTEXT_ID, KIXObjectType.CONTACT, ContextMode.EDIT, contactid
            );
        }
    }

}
