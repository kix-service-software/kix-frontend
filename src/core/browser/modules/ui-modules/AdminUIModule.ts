/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
import { FormValidationService } from "../../form/validation";
import {
    NotificationEmailRecipientValidator, NotificationService, NotificationBrowserFactory, NotificationTableFactory,
    NotificationFormService, NotificationLabelProvider, NotificationCreateAction, NewNotificationDialogContext,
    NotificationFilterTableFactory, NotificationDetailsContext, NotificationEditAction, EditNotificationDialogContext
} from "../../notification";
import {
    ContextType, ContextMode, ContextDescriptor, KIXObjectType, ConfiguredDialogWidget, WidgetConfiguration, CRUD
} from "../../../model";
import { LogFileLabelProvider } from "../../log/LogFileLabelProvider";
import { LogFileService } from "../../log/LogFileService";
import { LogFileBrowserFactory } from "../../log/LogFileBrowserFactory";
import { LogFileTableFactory } from "../../log/table/LogFileTableFactory";
import { LogFileTableCSSHandler } from "../../log/table/LogFileTableCSSHandler";
import { ConsoleCommandService } from "../../console/ConsoleCommandService";
import { ConsoleCommandBrowserFactory } from "../../console/ConsoleCommandBrowserFactory";
import { WebformService } from "../../webform/WebformService";
import { WebformBrowserFactory } from "../../webform/WebformBrowserFactory";
import { WebformTableFactory } from "../../webform/WebformTableFactory";
import { WebformLabelProvider } from "../../webform/WebformLabelProvider";
import { WebformCreateAction } from "../../webform/actions/WebformCreateAction";
import { NewWebformDialogContext } from "../../webform/actions/NewWebformDialogContext";

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
            await this.registerNotifications();
            await this.registerWebforms();
        }
    }

    private async registerI18N(): Promise<void> {
        ActionFactory.getInstance().registerAction('i18n-admin-translation-csv-export', TranslationCSVExportAction);

        ServiceRegistry.registerServiceInstance(TranslationFormService.getInstance());
        ServiceRegistry.registerServiceInstance(NotificationService.getInstance());
        ServiceRegistry.registerServiceInstance(LogFileService.getInstance());
        ServiceRegistry.registerServiceInstance(ConsoleCommandService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.NOTIFICATION, NotificationBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(KIXObjectType.LOG_FILE, LogFileBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONSOLE_COMMAND, ConsoleCommandBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new LogFileTableFactory());
        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.LOG_FILE, new LogFileTableCSSHandler()
        );

        TableFactoryService.getInstance().registerFactory(new TranslationPatternTableFactory());
        TableFactoryService.getInstance().registerFactory(new TranslationLanguageTableFactory());

        LabelService.getInstance().registerLabelProvider(new LogFileLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TranslationPatternLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TranslationLanguageLabelProvider());
        LabelService.getInstance().registerLabelProvider(new NotificationLabelProvider());

        await this.initTranslation();
    }

    private async initTranslation(): Promise<void> {
        if (await this.checkPermission('system/i18n/translations', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('i18n-admin-translation-create', TranslationCreateAction);
            const newTranslationDialogContext = new ContextDescriptor(
                NewTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION_PATTERN],
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
                KIXObjectType.TRANSLATION_PATTERN,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/i18n/translations/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('i18n-admin-translation-edit', TranslationEditAction);
            const editTranslationDialogContext = new ContextDescriptor(
                EditTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION_PATTERN],
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
                KIXObjectType.TRANSLATION_PATTERN,
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

    private async registerNotifications(): Promise<void> {
        FormValidationService.getInstance().registerValidator(new NotificationEmailRecipientValidator());

        ServiceRegistry.registerServiceInstance(NotificationService.getInstance());
        ServiceRegistry.registerServiceInstance(NotificationFormService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.NOTIFICATION, NotificationBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new NotificationTableFactory());
        LabelService.getInstance().registerLabelProvider(new NotificationLabelProvider());
        TableFactoryService.getInstance().registerFactory(new NotificationFilterTableFactory());

        await this.initNotification();
    }

    private async initNotification(): Promise<void> {
        if (await this.checkPermission('system/communication/notifications', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('notification-create', NotificationCreateAction);
            const newNotificationDialogContext = new ContextDescriptor(
                NewNotificationDialogContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-notification-dialog', ['notifications'], NewNotificationDialogContext
            );
            ContextService.getInstance().registerContext(newNotificationDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-notification-dialog',
                new WidgetConfiguration(
                    'new-notification-dialog', 'Translatable#New Notification', [], {},
                    false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.NOTIFICATION,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/communication/notifications/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('notification-edit', NotificationEditAction);
            const editNotificationDialogContext = new ContextDescriptor(
                EditNotificationDialogContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-notification-dialog', ['notifications'], EditNotificationDialogContext
            );
            ContextService.getInstance().registerContext(editNotificationDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-notification-dialog',
                new WidgetConfiguration(
                    'edit-notification-dialog', 'Translatable#Edit Notification', [], {},
                    false, false, 'kix-icon-edit'
                ),
                KIXObjectType.NOTIFICATION,
                ContextMode.EDIT_ADMIN
            ));
        }

        const notificationDetailsContext = new ContextDescriptor(
            NotificationDetailsContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['notifications'], NotificationDetailsContext
        );
        ContextService.getInstance().registerContext(notificationDetailsContext);
    }

    private async registerWebforms(): Promise<void> {
        ActionFactory.getInstance().registerAction('webform-create-action', WebformCreateAction);
        ServiceRegistry.registerServiceInstance(WebformService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.WEBFORM, WebformBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new WebformTableFactory());
        LabelService.getInstance().registerLabelProvider(new WebformLabelProvider());

        const newWebformDialogContext = new ContextDescriptor(
            NewWebformDialogContext.CONTEXT_ID, [KIXObjectType.WEBFORM],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-webform-dialog', ['webforms'], NewWebformDialogContext
        );
        ContextService.getInstance().registerContext(newWebformDialogContext);

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-webform-dialog',
            new WidgetConfiguration(
                'new-webform-dialog', 'Translatable#New Webform', [], {},
                false, false, 'kix-icon-new-gear'
            ),
            KIXObjectType.WEBFORM,
            ContextMode.CREATE_ADMIN
        ));
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}
