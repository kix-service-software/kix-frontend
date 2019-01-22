import {
    AbstractMarkoComponent, ActionFactory, ServiceRegistry, ContextService,
    StandardTableFactoryService, LabelService, DialogService, FactoryService, PersonalSettingsFormService
} from '../../core/browser';
import { ComponentState } from './ComponentState';
import { SearchService, SearchResultPrintAction, SearchContext } from '../../core/browser/search';
import { CSVExportAction, BulkAction } from '../../core/browser/actions';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, KIXObjectCache, LinkCacheHandler,
    ConfiguredDialogWidget, WidgetConfiguration, UserCacheHandler
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
import { AgentService } from '../../core/browser/application';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.getInstance().registerServiceInstance(AgentService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(SearchService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(LinkService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(GeneralCatalogService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(TextModuleService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(SysConfigService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(SlaService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(ObjectIconService.getInstance());

        ServiceRegistry.getInstance().registerServiceInstance(PersonalSettingsFormService.getInstance());

        KIXObjectCache.registerCacheHandler(new LinkCacheHandler());
        KIXObjectCache.registerCacheHandler(new UserCacheHandler());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.GENERAL_CATALOG_ITEM, GeneralCatalogBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(KIXObjectType.TEXT_MODULE, TextModuleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SLA, SlaBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.OBJECT_ICON, ObjectIconBrowserFactory.getInstance()
        );

        StandardTableFactoryService.getInstance().registerFactory(new LinkObjectTableFactory());
        StandardTableFactoryService.getInstance().registerFactory(new TextModulesTableFactory());

        LabelService.getInstance().registerLabelProvider(new SlaLabelProvider());
        LabelService.getInstance().registerLabelProvider(new LinkObjectLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TextModuleLabelProvider());

        ActionFactory.getInstance().registerAction('csv-export-action', CSVExportAction);
        ActionFactory.getInstance().registerAction('bulk-action', BulkAction);
        ActionFactory.getInstance().registerAction('search-result-print-action', SearchResultPrintAction);
        ActionFactory.getInstance().registerAction('linked-objects-edit-action', LinkedObjectsEditAction);

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
