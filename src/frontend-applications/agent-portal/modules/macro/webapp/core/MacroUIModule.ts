/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextType } from '../../../../model/ContextType';
import { IUIModule } from '../../../../model/IUIModule';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { EditMacroDialogContext } from './EditMacroDialogContext';
import { MacroActionLabelProvider } from './MacroActionLabelProvider';
import { MacroService } from './MacroService';
import { NewMacroDialogContext } from './NewMacroDialogContext';
import { MacroFormFieldValueHandler } from './MacroFormFieldValueHandler';
import { MacroFormService } from './MacroFormService';
import { MacroLabelProvider } from './MacroLabelProvider';
import { MacroTableFactory } from './MacroTableFactory';
import { AssembleObjectOptionFieldHandler } from './option-field-handler/AssembleObjectOptionFieldHandler';
import { DynamicFieldSetOptionFieldHandler } from './option-field-handler/DynamicFieldSetOptionFieldHandler';
import { MacroOptionFieldHandler } from './option-field-handler/MacroOptionFieldHandler';

export class UIModule implements IUIModule {

    public name: string = 'MacroUIModule';

    public priority: number = 5000;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(MacroService.getInstance());
        ServiceRegistry.registerServiceInstance(MacroFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new MacroTableFactory());

        LabelService.getInstance().registerLabelProvider(new MacroLabelProvider());
        LabelService.getInstance().registerLabelProvider(new MacroActionLabelProvider());

        FormService.getInstance().addFormFieldValueHandler(new MacroFormFieldValueHandler());

        const newMacroDialogContext = new ContextDescriptor(
            NewMacroDialogContext.CONTEXT_ID, [KIXObjectType.MACRO],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['macros'], NewMacroDialogContext,
            [
                new UIComponentPermission('system/automation/macros', [CRUD.CREATE])
            ],
            'Translatable#New Ruleset Macro', 'kix-icon-gear',
            undefined, undefined, false
        );
        ContextService.getInstance().registerContext(newMacroDialogContext);

        const editMacroDialogContext = new ContextDescriptor(
            EditMacroDialogContext.CONTEXT_ID, [KIXObjectType.MACRO],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['macros'], EditMacroDialogContext,
            [
                new UIComponentPermission('system/automation/macros', [CRUD.CREATE])
            ],
            'Translatable#Edit Ruleset Macro', 'kix-icon-gear',
            undefined, undefined, false
        );
        ContextService.getInstance().registerContext(editMacroDialogContext);
    }

    public async registerExtensions(): Promise<void> {
        MacroService.getInstance().registerOptionFieldHandler(new MacroOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new AssembleObjectOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new DynamicFieldSetOptionFieldHandler());
    }

}