/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../application/IUIModule";
import { ServiceRegistry, FactoryService } from "../../kix";
import { KIXObjectType, ContextDescriptor, ContextMode, ContextType } from "../../../model";
import { ActionFactory } from "../../ActionFactory";
import { LabelService } from "../../LabelService";
import { TableFactoryService } from "../../table";
import { ContextService } from "../../context";
import {
    TextModuleService, TextModuleBrowserFactory, TextModuleFormService, TextModulesTableFactory,
    TextModuleLabelProvider, TextModuleCreateAction, NewTextModuleDialogContext, EditTextModuleDialogContext
} from "../../text-modules";
import { TextModuleCSVExportAction } from "../../text-modules/actions/TextModuleCSVExportAction";

export class UIModule implements IUIModule {

    public priority: number = 51;

    public name: string = 'TextModulesUIModule';

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

        ActionFactory.getInstance().registerAction('text-module-create', TextModuleCreateAction);

        const newTextModuleDialogContext = new ContextDescriptor(
            NewTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-text-module-dialog', ['text-modules'], NewTextModuleDialogContext
        );
        await ContextService.getInstance().registerContext(newTextModuleDialogContext);

        const editTextModuleDialogContext = new ContextDescriptor(
            EditTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-text-module-dialog', ['text-modules'], EditTextModuleDialogContext
        );
        await ContextService.getInstance().registerContext(editTextModuleDialogContext);
    }

}
