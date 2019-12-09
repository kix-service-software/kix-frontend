/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ActionFactory, ServiceRegistry, ContextService,
    LabelService, FactoryService, TableFactoryService, TableCSSHandlerRegistry,
    PersonalSettingsDialogContext, PersonalSettingsFormService
} from '../../../../core/browser';
import { CSVExportAction, BulkAction, ImportAction, PrintAction } from '../../../../core/browser/actions';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode
} from '../../../../core/model';
import { SearchContext } from '../../../../core/browser/search/context/SearchContext';
import { SwitchColumnOrderAction } from '../../../../core/browser/table/actions';
import { PermissionLabelProvider } from '../../../../core/browser/permission';
import { PermissionsTableFactory, PermissionTableCSSHandler } from '../../../../core/browser/application';
import { ServiceService } from '../../../../core/browser/service/ServiceService';
import { LinkService } from '../../../../core/browser/link';
import { DynamicFieldService } from '../../../../core/browser/dynamic-fields';
import { SlaService, SlaBrowserFactory, SlaLabelProvider } from '../../../../core/browser/sla';
import { ObjectIconService, ObjectIconBrowserFactory } from '../../../../core/browser/icon';
import { BulkDialogContext } from '../../../../core/browser/bulk';
import { ServiceBrowserFactory } from '../../../../core/browser/service/ServiceBrowserFactory';
import { ValidObjectBrowserFactory } from '../../../../core/browser/valid/ValidObjectBrowserFactory';
import { ValidService } from '../../../../core/browser/valid/ValidService';
import { TranslationFormService } from '../../../../core/browser/i18n/admin/TranslationFormService';
import { IUIModule } from '../../application/IUIModule';
import { NewSearchAction, EditSearchAction, SaveSearchAction, DeleteSearchAction } from '../../search/actions';
import { LoadSearchAction } from '../../kix/search/actions';
import { SearchService } from '../../kix/search/SearchService';
import { InvalidObjectCSSHandler } from '../../table/InvalidObjectCSSHandler';
import { FormValidationService } from '../../form/validation';
import { UserPasswordValidator } from '../../user/UserPasswordValidator';
import { ValidObjectLabelProvider } from '../../valid/ValidObjectLabelProvider';
import {
    NotificationService, NotificationTableFactory, NotificationLabelProvider, NotificationBrowserFactory
} from '../../notification';
import { TicketLabelProvider, ArticleLabelProvider } from '../../ticket';
import { ChannelService } from '../../channel';
import { ContextFactory } from '../../context/ContextFactory';

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'ApplicationUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(LinkService.getInstance());
        ServiceRegistry.registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.registerServiceInstance(SlaService.getInstance());
        ServiceRegistry.registerServiceInstance(ObjectIconService.getInstance());
        ServiceRegistry.registerServiceInstance(ServiceService.getInstance());
        ServiceRegistry.registerServiceInstance(ValidService.getInstance());
        ServiceRegistry.registerServiceInstance(ChannelService.getInstance());

        ServiceRegistry.registerServiceInstance(NotificationService.getInstance());
        TableFactoryService.getInstance().registerFactory(new NotificationTableFactory());
        LabelService.getInstance().registerLabelProvider(new NotificationLabelProvider());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.NOTIFICATION, NotificationBrowserFactory.getInstance()
        );

        ServiceRegistry.registerServiceInstance(TranslationFormService.getInstance());
        ServiceRegistry.registerServiceInstance(PersonalSettingsFormService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.VALID_OBJECT, ValidObjectBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(KIXObjectType.SERVICE, ServiceBrowserFactory.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.OBJECT_ICON, ObjectIconBrowserFactory.getInstance()
        );

        LabelService.getInstance().registerLabelProvider(new PermissionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ValidObjectLabelProvider());

        LabelService.getInstance().registerLabelProvider(new TicketLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ArticleLabelProvider());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.SLA, SlaBrowserFactory.getInstance()
        );
        LabelService.getInstance().registerLabelProvider(new SlaLabelProvider());

        TableFactoryService.getInstance().registerFactory(new PermissionsTableFactory());
        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.PERMISSION, new PermissionTableCSSHandler()
        );

        TableCSSHandlerRegistry.getInstance().registerCommonCSSHandler(new InvalidObjectCSSHandler());

        ActionFactory.getInstance().registerAction('csv-export-action', CSVExportAction);
        ActionFactory.getInstance().registerAction('bulk-action', BulkAction);
        ActionFactory.getInstance().registerAction('print-action', PrintAction);
        ActionFactory.getInstance().registerAction('switch-column-order-action', SwitchColumnOrderAction);
        ActionFactory.getInstance().registerAction('import-action', ImportAction);

        ActionFactory.getInstance().registerAction('new-search-action', NewSearchAction);
        ActionFactory.getInstance().registerAction('edit-search-action', EditSearchAction);
        ActionFactory.getInstance().registerAction('save-search-action', SaveSearchAction);
        ActionFactory.getInstance().registerAction('delete-search-action', DeleteSearchAction);
        ActionFactory.getInstance().registerAction('load-search-action', LoadSearchAction);

        FormValidationService.getInstance().registerValidator(new UserPasswordValidator());

        await this.registerContexts();
        await this.registerBookmarks();
    }

    public async registerContexts(): Promise<void> {
        const dialogs = ContextFactory.getInstance().getContextDescriptors(ContextMode.SEARCH);
        if (dialogs && dialogs.length) {
            const searchContext = new ContextDescriptor(
                SearchContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
                false, 'search', ['search'], SearchContext
            );
            await ContextService.getInstance().registerContext(searchContext);
        }

        const bulkDialogContext = new ContextDescriptor(
            BulkDialogContext.CONTEXT_ID, [KIXObjectType.ANY],
            ContextType.DIALOG, ContextMode.EDIT_BULK,
            false, 'bulk-dialog', ['bulk'], BulkDialogContext
        );
        await ContextService.getInstance().registerContext(bulkDialogContext);

        const settingsDialogContext = new ContextDescriptor(
            PersonalSettingsDialogContext.CONTEXT_ID, [KIXObjectType.PERSONAL_SETTINGS],
            ContextType.DIALOG, ContextMode.PERSONAL_SETTINGS,
            false, 'personal-settings-dialog', ['personal-settings'], PersonalSettingsDialogContext
        );
        await ContextService.getInstance().registerContext(settingsDialogContext);
    }

    private async registerBookmarks(): Promise<void> {
        await SearchService.getInstance().getSearchBookmarks(true);
    }

}
