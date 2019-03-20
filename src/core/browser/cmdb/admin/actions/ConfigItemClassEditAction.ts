import { AbstractAction, FormInstance, KIXObjectType, ContextMode } from "../../../../model";
import { FormService } from "../../../form";
import { ContextService } from "../../../context";

export class ConfigItemClassEditAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-config-item-class-form', false);
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.CONFIG_ITEM_CLASS, ContextMode.EDIT_ADMIN, null, true, 'Edit COre Data'
        );
    }

}
