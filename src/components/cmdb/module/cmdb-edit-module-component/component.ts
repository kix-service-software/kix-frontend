import {
    AbstractMarkoComponent, ContextService, DialogService, ActionFactory, InitComponent
} from "../../../../core/browser";
import { ComponentState } from './ComponentState';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from "../../../../core/model";
import {
    NewConfigItemDialogContext, EditConfigItemDialogContext, ConfigItemCreateAction, ConfigItemEditAction
} from "../../../../core/browser/cmdb";

class Component extends AbstractMarkoComponent implements InitComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async init(): Promise<void> {

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

module.exports = Component;
