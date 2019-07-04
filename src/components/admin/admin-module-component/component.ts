import {
    AbstractMarkoComponent, ContextService, ActionFactory, DialogService,
    TableFactoryService, LabelService, ServiceRegistry, InitComponent
} from '../../../core/browser';
import { ComponentState } from './ComponentState';
import { AdminContext, AdministrationSocketClient } from '../../../core/browser/admin';
import {
    ContextDescriptor, KIXObjectType, ContextMode, ContextType, WidgetConfiguration, ConfiguredDialogWidget, CRUD
} from '../../../core/model';
import {
    TranslationCreateAction, TranslationEditAction, TranslationCSVExportAction
} from '../../../core/browser/i18n/admin/actions';
import {
    TranslationDetailsContext, EditTranslationDialogContext, NewTranslationDialogContext
} from '../../../core/browser/i18n/admin/context';
import { AuthenticationSocketClient } from '../../../core/browser/application/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../core/model/UIComponentPermission';
import {
    TranslationPatternTableFactory, TranslationLanguageTableFactory
} from '../../../core/browser/i18n/admin/table';
import { TranslationPatternLabelProvider, TranslationLanguageLabelProvider } from '../../../core/browser/i18n';
import { TranslationFormService } from '../../../core/browser/i18n/admin/TranslationFormService';

class Component extends AbstractMarkoComponent implements InitComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async init(): Promise<void> {
        const adminModules = await AdministrationSocketClient.getInstance().loadAdminCategories();

        if (adminModules && adminModules.length) {
            const contextDescriptor = new ContextDescriptor(
                AdminContext.CONTEXT_ID, [KIXObjectType.ANY],
                ContextType.MAIN, ContextMode.DASHBOARD,
                false, 'admin', ['admin'], AdminContext
            );
            ContextService.getInstance().registerContext(contextDescriptor);

            await this.registerI18N();
        }
    }

    private async registerI18N(): Promise<void> {

        ActionFactory.getInstance().registerAction('i18n-admin-translation-csv-export', TranslationCSVExportAction);

        TableFactoryService.getInstance().registerFactory(new TranslationPatternTableFactory());
        TableFactoryService.getInstance().registerFactory(new TranslationLanguageTableFactory());
        LabelService.getInstance().registerLabelProvider(new TranslationPatternLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TranslationLanguageLabelProvider());

        ServiceRegistry.registerServiceInstance(TranslationFormService.getInstance());

        if (await this.checkPermission('system/i18n/translations', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('i18n-admin-translation-create', TranslationCreateAction);
            const newTranslationDialogContext = new ContextDescriptor(
                NewTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-translation-dialog', ['translations'], NewTranslationDialogContext
            );
            ContextService.getInstance().registerContext(newTranslationDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-translation-dialog',
                new WidgetConfiguration(
                    'new-translation-dialog', 'Translatable#New Translation', [], {},
                    false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.TRANSLATION,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/i18n/translations/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('i18n-admin-translation-edit', TranslationEditAction);
            const editTranslationDialogContext = new ContextDescriptor(
                EditTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-translation-dialog', ['translations'], EditTranslationDialogContext
            );
            ContextService.getInstance().registerContext(editTranslationDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-translation-dialog',
                new WidgetConfiguration(
                    'edit-translation-dialog', 'Translatable#Edit Translation', [], {},
                    false, false, 'kix-icon-edit'
                ),
                KIXObjectType.TRANSLATION,
                ContextMode.EDIT_ADMIN
            ));
        }

        const translationDetailsContext = new ContextDescriptor(
            TranslationDetailsContext.CONTEXT_ID, [KIXObjectType.TRANSLATION],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['translations'], TranslationDetailsContext
        );
        ContextService.getInstance().registerContext(translationDetailsContext);
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}

module.exports = Component;
