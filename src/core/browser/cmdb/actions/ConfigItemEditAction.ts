import { AbstractAction, KIXObjectType, ContextMode, ConfigItem, ConfigItemClass } from "../../../model";
import { ContextService, AdditionalContextInformation } from "../../context";
import { FormService } from "../../form";
import { EditConfigItemDialogContext, ConfigItemDetailsContext } from "../context";
import { ConfigItemFormFactory } from "../ConfigItemFormFactory";
import { KIXObjectService } from "../../kix";

export class ConfigItemEditAction extends AbstractAction<ConfigItem> {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const formId = await this.getFormId();

        ContextService.getInstance().setDialogContext(
            EditConfigItemDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM, ContextMode.EDIT,
            null, true, undefined, undefined, formId
        );
    }

    private async getFormId(): Promise<string> {
        const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
            ConfigItemDetailsContext.CONTEXT_ID
        );
        let formId: string;
        if (context) {
            const configItem = await context.getObject<ConfigItem>();
            if (configItem && configItem.ClassID) {
                const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                    KIXObjectType.CONFIG_ITEM_CLASS, [configItem.ClassID]
                );

                if (ciClasses && ciClasses.length) {
                    formId = ConfigItemFormFactory.getInstance().getFormId(ciClasses[0], true);
                }
            }
        }

        return formId;
    }

}
