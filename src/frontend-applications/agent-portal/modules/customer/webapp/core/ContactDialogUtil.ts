/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { NewContactDialogContext, ContactDetailsContext, EditContactDialogContext } from ".";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../model/ContextMode";
import { Contact } from "../../model/Contact";

export class ContactDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewContactDialogContext.CONTEXT_ID, KIXObjectType.CONTACT, ContextMode.CREATE
        );
    }

    public static async edit(contactId?: string | number): Promise<void> {
        if (!contactId) {
            const context = await ContextService.getInstance().getContext<ContactDetailsContext>(
                ContactDetailsContext.CONTEXT_ID
            );

            if (context) {
                contactId = context.getObjectId();
            }
        }

        if (contactId) {
            ContextService.getInstance().setDialogContext(
                EditContactDialogContext.CONTEXT_ID, KIXObjectType.CONTACT, ContextMode.EDIT, contactId
            );
        }
    }

    public static async duplicate(contact: Contact): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewContactDialogContext.CONTEXT_ID, KIXObjectType.CONTACT, ContextMode.CREATE, contact.ID
        );
    }

}
