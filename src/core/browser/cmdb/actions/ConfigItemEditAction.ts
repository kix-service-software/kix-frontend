import { AbstractAction, KIXObjectType, ContextMode, ContextType, ConfigItem } from "../../../model";
import { ContextService } from "../../context";
import { FormService } from "../../form";
import { EditConfigItemDialogContext } from "../context";

export class ConfigItemEditAction extends AbstractAction<ConfigItem> {

    public initAction(): void {
        this.text = "Bearbeiten";
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const mainContext = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        let formId;
        if (mainContext) {
            const configItem = await mainContext.getObject<ConfigItem>();
            if (configItem) {
                if (configItem.ClassID && configItem.Class) {
                    formId = `CMDB_CI_${configItem.Class}_${configItem.ClassID}_EDIT`;
                } else {
                    formId = null;
                }
            }
        }
        await FormService.getInstance().getFormInstance(formId, false);

        const dialogContext = await ContextService.getInstance().getContext(EditConfigItemDialogContext.CONTEXT_ID);
        if (dialogContext) {
            dialogContext.setAdditionalInformation([formId]);
        }
        ContextService.getInstance().setDialogContext(
            EditConfigItemDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM, ContextMode.EDIT
        );
    }

}
