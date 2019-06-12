import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService, ActionFactory, ContextService, DialogService
} from '../../../core/browser';
import {
    KIXObjectType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, ContextDescriptor, ContextType, CRUD
} from '../../../core/model';
import { TableFactoryService } from '../../../core/browser/table';
import {
    TextModuleService, TextModuleBrowserFactory, TextModulesTableFactory, TextModuleLabelProvider,
    NewTextModuleDialogContext, TextModuleCreateAction, EditTextModuleDialogContext, TextModuleFormService
} from '../../../core/browser/text-modules';
import { UIComponentPermission } from '../../../core/model/UIComponentPermission';
import { AuthenticationSocketClient } from '../../../core/browser/application/AuthenticationSocketClient';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TextModuleService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TEXT_MODULE, TextModuleBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new TextModulesTableFactory());
        LabelService.getInstance().registerLabelProvider(new TextModuleLabelProvider());

        if (await this.checkPermission('system/textmodules', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('text-module-create', TextModuleCreateAction);

            const newTextModuleDialogContext = new ContextDescriptor(
                NewTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-text-module-dialog', ['text-modules'], NewTextModuleDialogContext
            );
            ContextService.getInstance().registerContext(newTextModuleDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-text-module-dialog',
                new WidgetConfiguration(
                    'new-text-module-dialog', 'Translatable#New Text Module',
                    [], {}, false, false, null, 'kix-icon-new-gear'
                ),
                KIXObjectType.TEXT_MODULE,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/textmodules/*', CRUD.UPDATE)) {
            const editTextModuleDialogContext = new ContextDescriptor(
                EditTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-text-module-dialog', ['text-modules'], EditTextModuleDialogContext
            );
            ContextService.getInstance().registerContext(editTextModuleDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-text-module-dialog',
                new WidgetConfiguration(
                    'edit-text-module-dialog', 'Translatable#Edit Text Module',
                    [], {}, false, false, null, 'kix-icon-edit'
                ),
                KIXObjectType.TEXT_MODULE,
                ContextMode.EDIT_ADMIN
            ));
        }
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}

module.exports = Component;
