/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigItemDetailsContext, EditConfigItemDialogContext, NewConfigItemDialogContext } from "./context";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../model/ContextMode";
import { ConfigItem } from "../../model/ConfigItem";

export class ConfigItemDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewConfigItemDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM, ContextMode.CREATE
        );
    }

    public static async edit(configItemId?: string | number): Promise<void> {
        if (!configItemId) {
            configItemId = await this.getConfigItemId();
        }

        if (configItemId) {
            await this.setContextClassId();

            ContextService.getInstance().setDialogContext(
                EditConfigItemDialogContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM, ContextMode.EDIT, configItemId
            );
        }
    }

    private static async  getConfigItemId(): Promise<number> {
        let configItemId: number;

        const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
            ConfigItemDetailsContext.CONTEXT_ID
        );

        if (context) {
            configItemId = Number(context.getObjectId());
        }

        return configItemId;
    }

    private static async setContextClassId(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
            ConfigItemDetailsContext.CONTEXT_ID
        );
        const configItem = await context.getObject<ConfigItem>();
        if (configItem) {
            const editContext = await ContextService.getInstance().getContext<EditConfigItemDialogContext>(
                EditConfigItemDialogContext.CONTEXT_ID
            );
            if (editContext) {
                editContext.setAdditionalInformation('CI_CLASS_ID', configItem.ClassID);
            }
        }

    }

}
