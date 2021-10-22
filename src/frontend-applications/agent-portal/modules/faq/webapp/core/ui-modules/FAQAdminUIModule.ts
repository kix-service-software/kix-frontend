/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    FAQService, FAQCategoryTableFactory, FAQCategoryLabelProvider, FAQCategoryFormService, FAQCategoryCSVExportAction,
    FAQCategoryCreateAction, NewFAQCategoryDialogContext, FAQCategoryEditAction, EditFAQCategoryDialogContext,
    FAQCategoryDetailsContext, FAQCategoryDeleteAction
} from '..';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../../model/ContextDescriptor';
import { ContextType } from '../../../../../model/ContextType';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';

export class UIModule implements IUIModule {

    public priority: number = 403;

    public name: string = 'FAQAdminUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {

        ServiceRegistry.registerServiceInstance(FAQService.getInstance());
        TableFactoryService.getInstance().registerFactory(new FAQCategoryTableFactory());
        LabelService.getInstance().registerLabelProvider(new FAQCategoryLabelProvider());
        ServiceRegistry.registerServiceInstance(FAQCategoryFormService.getInstance());

        ActionFactory.getInstance().registerAction('faq-category-csv-export-action', FAQCategoryCSVExportAction);

        ActionFactory.getInstance().registerAction('faq-admin-category-create-action', FAQCategoryCreateAction);
        ActionFactory.getInstance().registerAction('faq-admin-category-delete-action', FAQCategoryDeleteAction);

        const newFAQCategoryContext = new ContextDescriptor(
            NewFAQCategoryDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_CATEGORY], ContextType.DIALOG,
            ContextMode.CREATE_ADMIN, false, 'object-dialog', ['faqcategories'],
            NewFAQCategoryDialogContext,
            [
                new UIComponentPermission('system/faq/categories', [CRUD.CREATE])
            ],
            'Translatable#New FAQ Category', 'kix-icon-gear', FAQCategoryDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(newFAQCategoryContext);

        ActionFactory.getInstance().registerAction('faq-admin-category-edit-action', FAQCategoryEditAction);

        const editFAQCategoryContext = new ContextDescriptor(
            EditFAQCategoryDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_CATEGORY], ContextType.DIALOG,
            ContextMode.EDIT_ADMIN, false, 'object-dialog', ['faqcategories'],
            EditFAQCategoryDialogContext,
            [
                new UIComponentPermission('system/faq/categories', [CRUD.CREATE])
            ],
            'Translatable#Edit FAQ Category', 'kix-icon-gear', FAQCategoryDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editFAQCategoryContext);

        const faqCategoryDetailsContextDescriptor = new ContextDescriptor(
            FAQCategoryDetailsContext.CONTEXT_ID, [KIXObjectType.FAQ_CATEGORY],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['faqcategories'], FAQCategoryDetailsContext,
            [
                new UIComponentPermission('system/faq/categories', [CRUD.READ])
            ],
            'Translatable#FAQ Category Details Context', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(faqCategoryDetailsContextDescriptor);

    }

}
