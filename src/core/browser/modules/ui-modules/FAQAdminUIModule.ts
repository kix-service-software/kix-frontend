/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextService, ActionFactory, ServiceRegistry, FactoryService, TableFactoryService, LabelService
} from '../../../../core/browser';
import { KIXObjectType, ContextType, ContextMode, ContextDescriptor } from '../../../../core/model';
import {
    FAQCategoryCSVExportAction, FAQService, FAQCategoryLabelProvider, FAQCategoryFormService
} from '../../../../core/browser/faq';
import {
    FAQCategoryCreateAction, NewFAQCategoryDialogContext, FAQCategoryEditAction,
    EditFAQCategoryDialogContext, FAQCategoryDetailsContext, FAQCategoryTableFactory
} from '../../../../core/browser/faq/admin';
import { FAQCategoryBrowserFactory } from '../../../../core/browser/faq/FAQCategoryBrowserFactory';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 403;

    public name: string = 'FAQAdminUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {

        ServiceRegistry.registerServiceInstance(FAQService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_CATEGORY, FAQCategoryBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new FAQCategoryTableFactory());
        LabelService.getInstance().registerLabelProvider(new FAQCategoryLabelProvider());
        ServiceRegistry.registerServiceInstance(FAQCategoryFormService.getInstance());

        ActionFactory.getInstance().registerAction('faq-category-csv-export-action', FAQCategoryCSVExportAction);

        ActionFactory.getInstance().registerAction('faq-admin-category-create-action', FAQCategoryCreateAction);

        const newFAQCategoryContext = new ContextDescriptor(
            NewFAQCategoryDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_CATEGORY], ContextType.DIALOG,
            ContextMode.CREATE_ADMIN, false, 'new-faq-category-dialog', ['faqcategories'],
            NewFAQCategoryDialogContext
        );
        await ContextService.getInstance().registerContext(newFAQCategoryContext);

        ActionFactory.getInstance().registerAction('faq-admin-category-edit-action', FAQCategoryEditAction);

        const editFAQCategoryContext = new ContextDescriptor(
            EditFAQCategoryDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_CATEGORY], ContextType.DIALOG,
            ContextMode.EDIT_ADMIN, false, 'edit-faq-category-dialog', ['faqcategories'],
            EditFAQCategoryDialogContext
        );
        await ContextService.getInstance().registerContext(editFAQCategoryContext);

        const faqCategoryDetailsContextDescriptor = new ContextDescriptor(
            FAQCategoryDetailsContext.CONTEXT_ID, [KIXObjectType.FAQ_CATEGORY],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['faqcategories'], FAQCategoryDetailsContext
        );
        await ContextService.getInstance().registerContext(faqCategoryDetailsContextDescriptor);

    }

}
