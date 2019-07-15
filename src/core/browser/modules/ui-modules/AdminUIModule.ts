import { IUIModule } from "../../application/IUIModule";
import { ContextService } from "../../context";
import { ActionFactory } from "../../ActionFactory";
import { TranslationCSVExportAction, TranslationCreateAction, TranslationEditAction } from "../../i18n/admin/actions";
import { TranslationPatternTableFactory, TranslationLanguageTableFactory } from "../../i18n/admin/table";
import { TranslationPatternLabelProvider, TranslationLanguageLabelProvider } from "../../i18n";
import { LabelService } from "../../LabelService";
import { TableFactoryService, TableCSSHandlerRegistry } from "../../table";
import { ServiceRegistry, FactoryService } from "../../kix";
import { TranslationFormService } from "../../i18n/admin/TranslationFormService";
import {
    NewTranslationDialogContext, EditTranslationDialogContext, TranslationDetailsContext
} from "../../i18n/admin/context";
import { DialogService } from "../../components";
import { AuthenticationSocketClient } from "../../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import { AdministrationSocketClient, AdminContext } from "../../admin";
import {
    ContextDescriptor, KIXObjectType, ContextMode, ContextType, ConfiguredDialogWidget, WidgetConfiguration, CRUD
} from "../../../model";
import { NotificationService } from "../../notifications/NotificationService";
import { NotificationBrowserFactory } from "../../notifications/NotificationBrowserFactory";
import { NotifiactionTableFactory } from "../../notifications/table";
import { NotificationLabelProvider } from "../../notifications/NotificationLabelProvider";
import { LogFileService } from "../../log/LogFileService";
import { LogFileBrowserFactory } from "../../log/LogFileBrowserFactory";
import { LogFileTableFactory } from "../../log/table/LogFileTableFactory";
import { LogFileLabelProvider } from "../../log/LogFileLabelProvider";
import { LogFileTableCSSHandler } from "../../log/table/LogFileTableCSSHandler";

export class UIModule implements IUIModule {

    public priority: number = 500;

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
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

        ServiceRegistry.registerServiceInstance(TranslationFormService.getInstance());
        ServiceRegistry.registerServiceInstance(NotificationService.getInstance());
        ServiceRegistry.registerServiceInstance(LogFileService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.NOTIFICATION, NotificationBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(KIXObjectType.LOG_FILE, LogFileBrowserFactory.getInstance());

        TableFactoryService.getInstance().registerFactory(new LogFileTableFactory());
        TableCSSHandlerRegistry.getInstance().registerCSSHandler(KIXObjectType.LOG_FILE, new LogFileTableCSSHandler());

        TableFactoryService.getInstance().registerFactory(new TranslationPatternTableFactory());
        TableFactoryService.getInstance().registerFactory(new TranslationLanguageTableFactory());
        TableFactoryService.getInstance().registerFactory(new NotifiactionTableFactory());

        LabelService.getInstance().registerLabelProvider(new LogFileLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TranslationPatternLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TranslationLanguageLabelProvider());
        LabelService.getInstance().registerLabelProvider(new NotificationLabelProvider());

        this.initTranslation();
    }

    private async initTranslation(): Promise<void> {
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
