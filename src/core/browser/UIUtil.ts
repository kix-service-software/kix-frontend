import { KIXObjectType, ContextType, ContextMode } from "../model";
import { ContextService } from "./context";

export class UIUtil {

    public static async getEditObjectId(type: KIXObjectType): Promise<number> {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        const dialogContextMode = dialogContext ? dialogContext.getDescriptor().contextMode : null;
        const isEditDialog = dialogContextMode
            && dialogContextMode === ContextMode.EDIT
            || dialogContextMode === ContextMode.EDIT_ADMIN ?
            true : false;
        const object = context && isEditDialog ? await context.getObject() : null;
        return object && object.KIXObjectType === type
            ? Number(object.ObjectId)
            : null;
    }

}
