import { IUIModule } from "../../application/IUIModule";
import { ServiceRegistry, FactoryService } from "../../kix";
import {
    KIXObjectType, CRUD, ContextDescriptor, ContextMode, ContextType, ConfiguredDialogWidget, WidgetConfiguration
} from "../../../model";
import { ActionFactory } from "../../ActionFactory";
import { LabelService } from "../../LabelService";
import { TableFactoryService } from "../../table";
import { ContextService } from "../../context";
import { DialogService } from "../../components";
import { AuthenticationSocketClient } from "../../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import {
    TextModuleService, TextModuleBrowserFactory, TextModuleFormService, TextModulesTableFactory,
    TextModuleLabelProvider, TextModuleCreateAction, NewTextModuleDialogContext, EditTextModuleDialogContext
} from "../../text-modules";
import { TextModuleCSVExportAction } from "../../text-modules/actions/TextModuleCSVExportAction";

export class UIModule implements IUIModule {

    public priority: number = 51;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TextModuleService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TEXT_MODULE, TextModuleBrowserFactory.getInstance()
        );
        ServiceRegistry.registerServiceInstance(TextModuleFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new TextModulesTableFactory());
        LabelService.getInstance().registerLabelProvider(new TextModuleLabelProvider());

        ActionFactory.getInstance().registerAction('text-module-csv-export-action', TextModuleCSVExportAction);

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
                    [], {}, false, false, 'kix-icon-new-gear'
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
                    [], {}, false, false, 'kix-icon-edit'
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
