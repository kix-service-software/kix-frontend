import { ContextService } from "../context";
import { KIXObjectType, ContextMode, ConfigItem, ConfigItemClass } from "../../model";
import { ConfigItemDetailsContext, EditConfigItemDialogContext, NewConfigItemDialogContext } from "./context";

export class ConfigItemDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewConfigItemDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM, ContextMode.CREATE
        );
    }

    public static async edit(configItemId?: string | number): Promise<void> {
        if (!configItemId) {
            const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
                ConfigItemDetailsContext.CONTEXT_ID
            );

            if (context) {
                configItemId = context.getObjectId();
            }
        }

        if (configItemId) {
            ContextService.getInstance().setDialogContext(
                EditConfigItemDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM, ContextMode.EDIT, configItemId
            );
        }
    }

}
