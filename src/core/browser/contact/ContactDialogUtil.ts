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
