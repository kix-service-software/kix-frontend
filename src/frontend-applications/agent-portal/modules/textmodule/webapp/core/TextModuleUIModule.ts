/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    TextModuleService, TextModuleBrowserFactory, TextModuleFormService, TextModulesTableFactory,
    TextModuleLabelProvider, TextModuleCreateAction, NewTextModuleDialogContext, EditTextModuleDialogContext
} from ".";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { TextModuleCSVExportAction } from "./actions/TextModuleCSVExportAction";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { TextModuleDuplicateAction } from "./actions";

export class UIModule implements IUIModule {

    public name: string = 'TextModuleUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 800;

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
        ActionFactory.getInstance().registerAction('text-module-duplicate', TextModuleDuplicateAction);

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
