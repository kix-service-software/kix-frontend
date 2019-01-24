import {
    AbstractMarkoComponent, ActionFactory, ServiceRegistry, ContextService,
    StandardTableFactoryService, LabelService, DialogService, FactoryService
} from '../../core/browser';
import { ComponentState } from './ComponentState';
import { SearchService, SearchResultPrintAction, SearchContext } from '../../core/browser/search';
import { CSVExportAction, BulkAction } from '../../core/browser/actions';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, KIXObjectCache, LinkCacheHandler,
    ConfiguredDialogWidget, WidgetConfiguration
} from '../../core/model';
import {
    LinkService, LinkedObjectsEditAction, EditLinkedObjectsDialogContext, LinkObjectTableFactory,
    LinkObjectLabelProvider
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
import { TranslationLabelProvider, TranslationBrowserFactory } from '../../core/browser/i18n';
import {
    TranslationCreateAction, TranslationImportAction, TranslationCSVExportAction
} from '../../core/browser/i18n/admin/actions';
import { TranslationTableFactory } from '../../core/browser/i18n/admin/table';
import { AgentService } from '../../core/browser/application';
import { PersonalSettingsFormService } from '../../core/browser/settings/PersonalSettingsFormService';
import { UserCacheHandler } from '../../core/model/kix/user/UserCacheHandler';

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
        ServiceRegistry.registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.registerServiceInstance(SlaService.getInstance());
        ServiceRegistry.registerServiceInstance(ObjectIconService.getInstance());
        ServiceRegistry.registerServiceInstance(TranslationService.getInstance());

        ServiceRegistry.registerServiceInstance(PersonalSettingsFormService.getInstance());

        KIXObjectCache.registerCacheHandler(new LinkCacheHandler());
        KIXObjectCache.registerCacheHandler(new UserCacheHandler());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.GENERAL_CATALOG_ITEM, GeneralCatalogBrowserFactory.getInstance()
        );

        FactoryService.getInstance().registerFactory(
            KIXObjectType.OBJECT_ICON, ObjectIconBrowserFactory.getInstance()
        );


        FactoryService.getInstance().registerFactory(KIXObjectType.TEXT_MODULE, TextModuleBrowserFactory.getInstance());
        StandardTableFactoryService.getInstance().registerFactory(new TextModulesTableFactory());
        LabelService.getInstance().registerLabelProvider(new TextModuleLabelProvider());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.SLA, SlaBrowserFactory.getInstance()
        );
        LabelService.getInstance().registerLabelProvider(new SlaLabelProvider());

        StandardTableFactoryService.getInstance().registerFactory(new LinkObjectTableFactory());
        LabelService.getInstance().registerLabelProvider(new LinkObjectLabelProvider());
        ActionFactory.getInstance().registerAction('linked-objects-edit-action', LinkedObjectsEditAction);


        FactoryService.getInstance().registerFactory(
            KIXObjectType.TRANSLATION, TranslationBrowserFactory.getInstance()
        );
        StandardTableFactoryService.getInstance().registerFactory(new TranslationTableFactory());
        LabelService.getInstance().registerLabelProvider(new TranslationLabelProvider());
        ActionFactory.getInstance().registerAction('i18n-admin-translation-create', TranslationCreateAction);
        ActionFactory.getInstance().registerAction('i18n-admin-translation-import', TranslationImportAction);
        ActionFactory.getInstance().registerAction('i18n-admin-translation-csv-export', TranslationCSVExportAction);

        ActionFactory.getInstance().registerAction('csv-export-action', CSVExportAction);
        ActionFactory.getInstance().registerAction('bulk-action', BulkAction);
        ActionFactory.getInstance().registerAction('search-result-print-action', SearchResultPrintAction);

        this.registerContexts();
        this.registerDialogs();
    }

    public registerContexts(): void {
        const searchContext = new ContextDescriptor(
            SearchContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'search', ['search'], SearchContext
        );
        ContextService.getInstance().registerContext(searchContext);

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
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-linked-objects-dialog',
            new WidgetConfiguration(
                'edit-linked-objects-dialog', 'Verknüpfungen bearbeiten', [], {}, false, false, null, 'kix-icon-link'
            ),
            KIXObjectType.LINK,
            ContextMode.EDIT_LINKS
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'personal-settings-dialog',
            new WidgetConfiguration(
                'personal-settings-dialog', 'Persönliche Einstellungen bearbeiten',
                [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.PERSONAL_SETTINGS,
            ContextMode.PERSONAL_SETTINGS
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'bulk-dialog',
            new WidgetConfiguration(
                'bulk-dialog', 'Objekte bearbeiten', [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.ANY,
            ContextMode.EDIT_BULK
        ));
    }

}

module.exports = Component;
