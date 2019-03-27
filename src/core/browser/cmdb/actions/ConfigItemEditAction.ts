import { AbstractAction, KIXObjectType, ContextMode, ContextType, ConfigItem, ConfigItemClass } from "../../../model";
import { ContextService } from "../../context";
import { FormService } from "../../form";
import { EditConfigItemDialogContext, ConfigItemDetailsContext } from "../context";
import { ConfigItemFormFactory } from "../ConfigItemFormFactory";
import { KIXObjectService } from "../../kix";

export class ConfigItemEditAction extends AbstractAction<ConfigItem> {

    public initAction(): void {
        this.text = "Bearbeiten";
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
            ConfigItemDetailsContext.CONTEXT_ID
        );
        let formId: string;
        if (context) {
            const configItem = await context.getObject<ConfigItem>();
            if (configItem) {
                if (configItem.ClassID) {
                    const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                        KIXObjectType.CONFIG_ITEM_CLASS, [configItem.ClassID]
                    );
                    if (ciClasses && ciClasses.length) {
                        formId = ConfigItemFormFactory.getInstance().getFormId(ciClasses[0], true);
                    }
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
            EditConfigItemDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM, ContextMode.EDIT, null, true
        );
    }

}
