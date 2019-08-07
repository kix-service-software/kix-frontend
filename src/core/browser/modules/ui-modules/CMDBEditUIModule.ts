/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, DialogService, ActionFactory } from "../../../../core/browser";
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from "../../../../core/model";
import {
    NewConfigItemDialogContext, EditConfigItemDialogContext, ConfigItemCreateAction, ConfigItemEditAction
} from "../../../../core/browser/cmdb";
import { IUIModule } from "../../application/IUIModule";

export class UIModule implements IUIModule {

    public priority: number = 201;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const newConfigItemDialogContext = new ContextDescriptor(
            NewConfigItemDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-config-item-dialog', ['configitems'], NewConfigItemDialogContext
        );
        ContextService.getInstance().registerContext(newConfigItemDialogContext);

        const editConfigItemContext = new ContextDescriptor(
            EditConfigItemDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-config-item-dialog', ['configitems'], EditConfigItemDialogContext
        );
        ContextService.getInstance().registerContext(editConfigItemContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-config-item-dialog',
            new WidgetConfiguration(
                'new-config-item-dialog', 'Translatable#New Config Item', [], {}, false, false, 'kix-icon-new-ci'
            ),
            KIXObjectType.CONFIG_ITEM,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-config-item-dialog',
            new WidgetConfiguration(
                'edit-config-item-dialog', 'Translatable#Edit Config Item', [], {}, false, false, 'kix-icon-edit'
            ),
            KIXObjectType.CONFIG_ITEM,
            ContextMode.EDIT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('config-item-create-action', ConfigItemCreateAction);
        ActionFactory.getInstance().registerAction('config-item-edit-action', ConfigItemEditAction);
    }
}
