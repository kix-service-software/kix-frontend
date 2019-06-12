import {
    AbstractMarkoComponent, ContextService, DialogService, ActionFactory
} from "../../../../core/browser";
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, CRUD
} from "../../../../core/model";
import {
    ConfigItemClassCreateAction, ConfigItemClassEditAction, ConfigItemClassDetailsContext,
    NewConfigItemClassDialogContext, EditConfigItemClassDialogContext
} from "../../../../core/browser/cmdb";
import { AuthenticationSocketClient } from "../../../../core/browser/application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../core/model/UIComponentPermission";

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        if (await this.checkPermission('system/cmdb/classes', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-create', ConfigItemClassCreateAction);

            const newConfigItemClassDetailsContext = new ContextDescriptor(
                NewConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                true, 'new-config-item-class-dialog', ['configitemclasses'], NewConfigItemClassDialogContext
            );
            ContextService.getInstance().registerContext(newConfigItemClassDetailsContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-config-item-class-dialog',
                new WidgetConfiguration(
                    'new-config-item-class-dialog', 'Translatable#New Class', [], {}, false, false, null,
                    'kix-icon-new-gear'
                ),
                KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/cmdb/classes/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-edit', ConfigItemClassEditAction);

            const editConfigItemClassContext = new ContextDescriptor(
                EditConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                true, 'edit-config-item-class-dialog', ['configitemclasses'], EditConfigItemClassDialogContext
            );
            ContextService.getInstance().registerContext(editConfigItemClassContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-config-item-class-dialog',
                new WidgetConfiguration(
                    'edit-config-item-class-dialog', 'Translatable#Edit Class', [], {},
                    false, false, null, 'kix-icon-edit'
                ),
                KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.EDIT_ADMIN
            ));
        }

        const configItemClassDetailsContext = new ContextDescriptor(
            ConfigItemClassDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitemclasses'], ConfigItemClassDetailsContext
        );
        ContextService.getInstance().registerContext(configItemClassDetailsContext);
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}

module.exports = Component;
