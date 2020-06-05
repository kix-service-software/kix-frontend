/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    TranslationPatternLabelProvider, TranslationLanguageLabelProvider, TranslationBrowserFactory,
    TranslationPatternBrowserFactory
} from '.';
import { FactoryService } from '../../../../modules/base-components/webapp/core/FactoryService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../base-components/webapp/core/table';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { TranslationCreateAction, TranslationCSVExportAction } from './admin/actions';
import { NewTranslationDialogContext, EditTranslationDialogContext } from './admin/context';
import { TranslationFormService } from './admin/TranslationFormService';
import { TranslationPatternTableFactory, TranslationLanguageTableFactory } from './admin/table';
import { TranslationService } from './TranslationService';

export class UIModule implements IUIModule {

    public name: string = 'TranslationUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 9999;

    public async register(): Promise<void> {
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TRANSLATION, TranslationBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TRANSLATION_PATTERN, TranslationPatternBrowserFactory.getInstance()
        );

        ServiceRegistry.registerServiceInstance(TranslationService.getInstance());
        ServiceRegistry.registerServiceInstance(TranslationFormService.getInstance());

        LabelService.getInstance().registerLabelProvider(new TranslationPatternLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TranslationLanguageLabelProvider());

        TableFactoryService.getInstance().registerFactory(new TranslationPatternTableFactory());
        TableFactoryService.getInstance().registerFactory(new TranslationLanguageTableFactory());

        ActionFactory.getInstance().registerAction('i18n-admin-translation-csv-export', TranslationCSVExportAction);
        ActionFactory.getInstance().registerAction('i18n-admin-translation-create', TranslationCreateAction);

        const newTranslationDialogContext = new ContextDescriptor(
            NewTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION_PATTERN],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-translation-dialog', ['translations'], NewTranslationDialogContext
        );
        await ContextService.getInstance().registerContext(newTranslationDialogContext);

        const editTranslationDialogContext = new ContextDescriptor(
            EditTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION_PATTERN],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-translation-dialog', ['translations'], EditTranslationDialogContext
        );
        await ContextService.getInstance().registerContext(editTranslationDialogContext);
    }
}
