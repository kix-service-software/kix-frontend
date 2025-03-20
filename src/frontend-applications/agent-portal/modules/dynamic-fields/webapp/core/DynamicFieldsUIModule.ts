/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { DynamicFieldService } from './DynamicFieldService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { DynamicFieldLabelProvider } from './DynamicFieldLabelProvider';
import { DynamicFieldTableFactory } from './DynamicFieldTableFactory';
import { ActionFactory } from '../../../base-components/webapp/core/ActionFactory';
import { DynamicFieldCreateAction } from './DynamicFieldCreateAction';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { NewDynamicFieldDialogContext } from './NewDynamicFieldDialogContext';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { DynamicFieldFormService } from './DynamicFieldFormService';
import { EditDynamicFieldDialogContext } from './EditDynamicFieldDialogContext';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { DynamicFieldValuePlaceholderHandler } from './DynamicFieldValuePlaceholderHandler';
import { FormValidationService } from '../../../base-components/webapp/core/FormValidationService';
import { DynamicFieldTextValidator } from './DynamicFieldTextValidator';
import { DynamicFieldDateTimeValidator } from './DynamicFieldDateTimeValidator';
import { DynamicFieldTypeLabelProvider } from './DynamicFieldTypeLabelProvider';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { DynamicFieldTableValidator } from './DynamicFieldTableValidator';
import { DynamicFieldDuplicateAction } from './DynamicFieldDuplicateAction';
import { DynamicFieldDeleteAction } from './DynamicFieldDeleteAction';
import { ChecklistSchema } from './config-schemas/ChecklistSchema';
import { TableSchema } from './config-schemas/TableSchema';
import { TextSchema } from './config-schemas/TextSchema';
import { TextAreaSchema } from './config-schemas/TextAreaSchema';
import { DateSchema } from './config-schemas/DateSchema';
import { DateTimeSchema } from './config-schemas/DateTimeSchema';
import { SelectionSchema } from './config-schemas/SelectionSchema';
import { CIReferenceSchema } from './config-schemas/CIReferenceSchema';

export class UIModule implements IUIModule {

    public priority: number = 400;

    public name: string = 'DynamicFieldsUIModule';

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.registerServiceInstance(DynamicFieldFormService.getInstance());

        PlaceholderService.getInstance().registerPlaceholderHandler(DynamicFieldValuePlaceholderHandler.getInstance());

        TableFactoryService.getInstance().registerFactory(new DynamicFieldTableFactory());

        LabelService.getInstance().registerLabelProvider(new DynamicFieldLabelProvider());
        LabelService.getInstance().registerLabelProvider(new DynamicFieldTypeLabelProvider());

        ActionFactory.getInstance().registerAction('dynamic-field-create-action', DynamicFieldCreateAction);
        ActionFactory.getInstance().registerAction('dynamic-field-duplicate-action', DynamicFieldDuplicateAction);
        ActionFactory.getInstance().registerAction('dynamic-field-delete-action', DynamicFieldDeleteAction);

        FormValidationService.getInstance().registerValidator(new DynamicFieldTextValidator());
        FormValidationService.getInstance().registerValidator(new DynamicFieldDateTimeValidator());
        FormValidationService.getInstance().registerValidator(new DynamicFieldTableValidator());

        this.registerContext();
        this.registerSchemas();
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

    private registerContext(): void {
        const newDynamicFieldContext = new ContextDescriptor(
            NewDynamicFieldDialogContext.CONTEXT_ID, [KIXObjectType.DYNAMIC_FIELD],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['dynamicfields'], NewDynamicFieldDialogContext,
            [
                new UIComponentPermission('system/dynamicfields', [CRUD.CREATE])
            ],
            'Translatable#New Dynamic Field', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(newDynamicFieldContext);

        const editDynamicFieldContext = new ContextDescriptor(
            EditDynamicFieldDialogContext.CONTEXT_ID, [KIXObjectType.DYNAMIC_FIELD],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['dynamicfields'], EditDynamicFieldDialogContext,
            [
                new UIComponentPermission('system/dynamicfields', [CRUD.CREATE])
            ],
            'Translatable#Edit Dynamic Field', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(editDynamicFieldContext);
    }

    private async registerSchemas(): Promise<void> {
        TextSchema.registerSchema();
        TextAreaSchema.registerSchema();
        ChecklistSchema.registerSchema();
        TableSchema.registerSchema();
        DateSchema.registerSchema();
        DateTimeSchema.registerSchema();
        SelectionSchema.registerSchema();
        CIReferenceSchema.registerSchema();
    }
}
