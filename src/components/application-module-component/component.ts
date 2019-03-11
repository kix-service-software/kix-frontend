import {
    AbstractMarkoComponent, ActionFactory, ServiceRegistry, ContextService,
    LabelService, FactoryService, TableFactoryService
} from '../../core/browser';
import { ComponentState } from './ComponentState';
import { SearchService } from '../../core/browser/search';
import { CSVExportAction, BulkAction, ImportAction } from '../../core/browser/actions';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, KIXObjectCache, LinkCacheHandler,
    ConfiguredDialogWidget, WidgetConfiguration, TranslationCacheHandler
} from '../../core/model';
import {
    LinkService, LinkedObjectsEditAction, EditLinkedObjectsDialogContext, LinkObjectTableFactory,
    LinkObjectLabelProvider,
    LinkObjectDialogContext
} from '../../core/browser/link';
import { GeneralCatalogService, GeneralCatalogBrowserFactory } from '../../core/browser/general-catalog';
import { DynamicFieldService } from '../../core/browser/dynamic-fields';
import {
    TextModuleService, TextModuleBrowserFactory, TextModuleLabelProvider, TextModulesTableFactory
} from '../../core/browser/text-modules';
import { SysConfigService } from '../../core/browser/sysconfig';
import { SlaService, SlaLabelProvider, SlaBrowserFactory } from '../../core/browser/sla';
import { ObjectIconService, ObjectIconBrowserFactory } from '../../core/browser/icon';
import { PersonalSettingsDialogContext } from '../../core/browser';
import { BulkDialogContext } from '../../core/browser/bulk';
import { TranslationService } from '../../core/browser/i18n/TranslationService';
import {
    TranslationLabelProvider, TranslationBrowserFactory, TranslationLanguageLabelProvider
} from '../../core/browser/i18n';
import {
    TranslationCreateAction, TranslationImportAction, TranslationCSVExportAction, TranslationEditAction
} from '../../core/browser/i18n/admin/actions';
import { TranslationTableFactory, TranslationLanguageTableFactory } from '../../core/browser/i18n/admin/table';
import { AgentService } from '../../core/browser/application';
import { PersonalSettingsFormService } from '../../core/browser/settings/PersonalSettingsFormService';
import { UserCacheHandler } from '../../core/model/kix/user/UserCacheHandler';
import {
    NewTranslationDialogContext, TranslationDetailsContext, EditTranslationDialogContext
} from '../../core/browser/i18n/admin/context';
import { TranslationFormService } from '../../core/browser/i18n/admin/TranslationFormService';
import { SearchResultPrintAction } from '../../core/browser/search/actions';
import { SearchContext } from '../../core/browser/search/context';
import { SwitchColumnOrderAction } from '../../core/browser/table/actions';
import { SystemAddressService } from '../../core/browser/system-address';
import { ImportDialogContext } from '../../core/browser/import';
import { DialogService } from '../../core/browser/components/dialog';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(AgentService.getInstance());
        ServiceRegistry.registerServiceInstance(SearchService.getInstance());
        ServiceRegistry.registerServiceInstance(LinkService.getInstance());
        ServiceRegistry.registerServiceInstance(GeneralCatalogService.getInstance());
        ServiceRegistry.registerServiceInstance(TextModuleService.getInstance());
        ServiceRegistry.registerServiceInstance(SysConfigService.getInstance());
        ServiceRegistry.registerServiceInstance(SystemAddressService.getInstance());
        ServiceRegistry.registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.registerServiceInstance(SlaService.getInstance());
        ServiceRegistry.registerServiceInstance(ObjectIconService.getInstance());
        ServiceRegistry.registerServiceInstance(TranslationService.getInstance());
        ServiceRegistry.registerServiceInstance(TranslationFormService.getInstance());

        ServiceRegistry.registerServiceInstance(PersonalSettingsFormService.getInstance());

        KIXObjectCache.registerCacheHandler(new LinkCacheHandler());
        KIXObjectCache.registerCacheHandler(new UserCacheHandler());
        KIXObjectCache.registerCacheHandler(new TranslationCacheHandler());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.GENERAL_CATALOG_ITEM, GeneralCatalogBrowserFactory.getInstance()
        );

        FactoryService.getInstance().registerFactory(
            KIXObjectType.OBJECT_ICON, ObjectIconBrowserFactory.getInstance()
        );


        FactoryService.getInstance().registerFactory(KIXObjectType.TEXT_MODULE, TextModuleBrowserFactory.getInstance());
        TableFactoryService.getInstance().registerFactory(new TextModulesTableFactory());
        LabelService.getInstance().registerLabelProvider(new TextModuleLabelProvider());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.SLA, SlaBrowserFactory.getInstance()
        );
        LabelService.getInstance().registerLabelProvider(new SlaLabelProvider());

        TableFactoryService.getInstance().registerFactory(new LinkObjectTableFactory());
        LabelService.getInstance().registerLabelProvider(new LinkObjectLabelProvider());
        ActionFactory.getInstance().registerAction('linked-objects-edit-action', LinkedObjectsEditAction);


        FactoryService.getInstance().registerFactory(
            KIXObjectType.TRANSLATION, TranslationBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new TranslationTableFactory());
        TableFactoryService.getInstance().registerFactory(new TranslationLanguageTableFactory());
        LabelService.getInstance().registerLabelProvider(new TranslationLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TranslationLanguageLabelProvider());
        ActionFactory.getInstance().registerAction('i18n-admin-translation-create', TranslationCreateAction);
        ActionFactory.getInstance().registerAction('i18n-admin-translation-edit', TranslationEditAction);
        ActionFactory.getInstance().registerAction('i18n-admin-translation-import', TranslationImportAction);
        ActionFactory.getInstance().registerAction('i18n-admin-translation-csv-export', TranslationCSVExportAction);

        ActionFactory.getInstance().registerAction('csv-export-action', CSVExportAction);
        ActionFactory.getInstance().registerAction('bulk-action', BulkAction);
        ActionFactory.getInstance().registerAction('search-result-print-action', SearchResultPrintAction);
        ActionFactory.getInstance().registerAction('switch-column-order-action', SwitchColumnOrderAction);
        ActionFactory.getInstance().registerAction('import-action', ImportAction);

        this.registerContexts();
        this.registerDialogs();
    }

    public registerContexts(): void {
        const searchContext = new ContextDescriptor(
            SearchContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'search', ['search'], SearchContext
        );
        ContextService.getInstance().registerContext(searchContext);

        const linkObjectDialogContext = new ContextDescriptor(
            LinkObjectDialogContext.CONTEXT_ID, [KIXObjectType.LINK],
            ContextType.DIALOG, ContextMode.CREATE,
            false, 'link-objects-dialog', ['links'], LinkObjectDialogContext
        );
        ContextService.getInstance().registerContext(linkObjectDialogContext);

        const editLinkObjectDialogContext = new ContextDescriptor(
            EditLinkedObjectsDialogContext.CONTEXT_ID, [KIXObjectType.LINK],
            ContextType.DIALOG, ContextMode.EDIT_LINKS,
            false, 'edit-linked-objects-dialog', ['links'], EditLinkedObjectsDialogContext
        );
        ContextService.getInstance().registerContext(editLinkObjectDialogContext);

        const bulkDialogContext = new ContextDescriptor(
            BulkDialogContext.CONTEXT_ID, [KIXObjectType.ANY],
            ContextType.DIALOG, ContextMode.EDIT_BULK,
            false, 'bulk-dialog', ['bulk'], BulkDialogContext
        );
        ContextService.getInstance().registerContext(bulkDialogContext);

        const settingsDialogContext = new ContextDescriptor(
            PersonalSettingsDialogContext.CONTEXT_ID, [KIXObjectType.PERSONAL_SETTINGS],
            ContextType.DIALOG, ContextMode.PERSONAL_SETTINGS,
            false, 'personal-settings-dialog', ['personal-settings'], PersonalSettingsDialogContext
        );
        ContextService.getInstance().registerContext(settingsDialogContext);

        const newTranslationDialogContext = new ContextDescriptor(
            NewTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-translation-dialog', ['translations'], NewTranslationDialogContext
        );
        ContextService.getInstance().registerContext(newTranslationDialogContext);

        const editTranslationDialogContext = new ContextDescriptor(
            EditTranslationDialogContext.CONTEXT_ID, [KIXObjectType.TRANSLATION],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-translation-dialog', ['translations'], EditTranslationDialogContext
        );
        ContextService.getInstance().registerContext(editTranslationDialogContext);

        const translationDetailsContext = new ContextDescriptor(
            TranslationDetailsContext.CONTEXT_ID, [KIXObjectType.TRANSLATION],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'i18n-translation-details', ['translations'], TranslationDetailsContext
        );
        ContextService.getInstance().registerContext(translationDetailsContext);

        const importDialogContext = new ContextDescriptor(
            ImportDialogContext.CONTEXT_ID, [KIXObjectType.ANY],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['import'], ImportDialogContext
        );
        ContextService.getInstance().registerContext(importDialogContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-linked-objects-dialog',
            new WidgetConfiguration(
                'edit-linked-objects-dialog', 'Translatable#Edit Links', [], {}, false, false, null, 'kix-icon-link'
            ),
            KIXObjectType.LINK,
            ContextMode.EDIT_LINKS
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'personal-settings-dialog',
            new WidgetConfiguration(
                'personal-settings-dialog', 'Translatable#Edit Personal Settings',
                [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.PERSONAL_SETTINGS,
            ContextMode.PERSONAL_SETTINGS
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'bulk-dialog',
            new WidgetConfiguration(
                'bulk-dialog', 'Translatable#Edit Objects', [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.ANY,
            ContextMode.EDIT_BULK
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-translation-dialog',
            new WidgetConfiguration(
                'new-translation-dialog', 'Translatable#New Translation', [], {},
                false, false, null, 'kix-icon-new-gear'
            ),
            KIXObjectType.TRANSLATION,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-translation-dialog',
            new WidgetConfiguration(
                'edit-translation-dialog', 'Translatable#Edit Translation', [], {}, false, false, null, 'kix-icon-gear'
            ),
            KIXObjectType.TRANSLATION,
            ContextMode.EDIT_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'import-dialog',
            new WidgetConfiguration(
                'import-dialog', 'Translatable#Import Objects', [], {}, false, false, null, 'kix-icon-import'
            ),
            KIXObjectType.ANY,
            ContextMode.IMPORT
        ));
    }

}

module.exports = Component;
