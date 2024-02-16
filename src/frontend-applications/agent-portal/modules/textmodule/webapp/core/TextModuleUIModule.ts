/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    TextModuleService, TextModuleFormService, TextModulesTableFactory,
    TextModuleLabelProvider, TextModuleCreateAction, NewTextModuleDialogContext, EditTextModuleDialogContext,
    TextModuleTableDeleteAction
} from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { TextModuleCSVExportAction } from './actions/TextModuleCSVExportAction';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { TextModuleDuplicateAction } from './actions';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';

export class UIModule implements IUIModule {

    public name: string = 'TextModuleUIModule';

    public priority: number = 800;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TextModuleService.getInstance());
        ServiceRegistry.registerServiceInstance(TextModuleFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new TextModulesTableFactory());
        LabelService.getInstance().registerLabelProvider(new TextModuleLabelProvider());

        ActionFactory.getInstance().registerAction('text-module-csv-export-action', TextModuleCSVExportAction);

        ActionFactory.getInstance().registerAction('text-module-create', TextModuleCreateAction);
        ActionFactory.getInstance().registerAction('text-module-duplicate', TextModuleDuplicateAction);
        ActionFactory.getInstance().registerAction('text-module-table-delete', TextModuleTableDeleteAction);

        const newTextModuleDialogContext = new ContextDescriptor(
            NewTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['text-modules'], NewTextModuleDialogContext,
            [
                new UIComponentPermission('system/textmodules', [CRUD.CREATE])
            ],
            'Translatable#New Textmodule', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newTextModuleDialogContext);
        const editTextModuleDialogContext = new ContextDescriptor(
            EditTextModuleDialogContext.CONTEXT_ID, [KIXObjectType.TEXT_MODULE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['text-modules'], EditTextModuleDialogContext,
            [
                new UIComponentPermission('system/textmodules', [CRUD.CREATE])
            ],
            'Translatable#Edit Textmodule', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editTextModuleDialogContext);
    }

    public async registerExtensions(): Promise<void> {
        return;
    }
}
