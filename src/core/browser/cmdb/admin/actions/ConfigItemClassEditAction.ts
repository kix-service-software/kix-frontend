import { AbstractAction, KIXObjectType, ContextMode } from "../../../../model";
import { ContextService } from "../../../context";
import { EditConfigItemClassDialogContext, ConfigItemClassDetailsContext } from "../context";

export class ConfigItemClassEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ConfigItemClassDetailsContext>(
            ConfigItemClassDetailsContext.CONTEXT_ID
        );

        if (context) {
            const classId = context.getObjectId();
            if (classId) {
                ContextService.getInstance().setDialogContext(
                    EditConfigItemClassDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM_CLASS,
                    ContextMode.EDIT_ADMIN, classId
                );
            }
        }
    }

}
