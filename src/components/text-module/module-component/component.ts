import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService, ActionFactory, ContextService, DialogService
} from '../../../core/browser';
import {
    KIXObjectType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, ContextDescriptor, ContextType
} from '../../../core/model';
import { TableFactoryService } from '../../../core/browser/table';
import {
    TextModuleService, TextModuleBrowserFactory, TextModulesTableFactory, TextModuleLabelProvider
} from '../../../core/browser/text-modules';

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

        this.registerAdminContexts();
        this.registerAdminActions();
        this.registerAdminDialogs();
    }

    private registerAdminContexts(): void {
        // const newTextModuleDialogContext = new ContextDescriptor(
        //     NewTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
        //     ContextType.DIALOG, ContextMode.CREATE_ADMIN,
        //     false, 'new-text-module-dialog', ['text-modules'], NewTextModuleDialogContext
        // );
        // ContextService.getInstance().registerContext(newTextModuleDialogContext);

        // const editTextModuleDialogContext = new ContextDescriptor(
        //     EditTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
        //     ContextType.DIALOG, ContextMode.EDIT_ADMIN,
        //     false, 'edit-text-module-dialog', ['text-modules'], EditTextModuleDialogContext
        // );
        // ContextService.getInstance().registerContext(editTextModuleDialogContext);
    }

    private registerAdminActions(): void {
        // ActionFactory.getInstance().registerAction(
        //     'text-module-create', TextModuleCreateAction
        // );
    }

    private registerAdminDialogs(): void {
        // DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
        //     'new-text-module-dialog',
        //     new WidgetConfiguration(
        //         'new-text-module-dialog', 'Translatable#New Text Module',
        //         [], {}, false, false, null, 'kix-icon-new-gear'
        //     ),
        //     KIXObjectType.TEXT_MODULE,
        //     ContextMode.CREATE_ADMIN
        // ));

        // DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
        //     'edit-text-module-dialog',
        //     new WidgetConfiguration(
        //         'edit-text-module-dialog', 'Translatable#Edit Text Module',
        //         [], {}, false, false, null, 'kix-icon-edit'
        //     ),
        //     KIXObjectType.TEXT_MODULE,
        //     ContextMode.EDIT_ADMIN
        // ));
    }
}

module.exports = Component;
