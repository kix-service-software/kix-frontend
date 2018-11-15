import {
    AbstractMarkoComponent, ActionFactory, ServiceRegistry, ContextService,
    StandardTableFactoryService, LabelService, DialogService, FactoryService
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';
import { SearchService, SearchResultPrintAction, SearchContext } from '@kix/core/dist/browser/search';
import { CSVExportAction, BulkAction } from '@kix/core/dist/browser/actions';
import {
    ContextDescriptor, KIXObjectType, ContextType, ContextMode, KIXObjectCache, LinkCacheHandler,
    ConfiguredDialogWidget, WidgetConfiguration
} from '@kix/core/dist/model';
import {
    LinkService, LinkedObjectsEditAction, EditLinkedObjectsDialogContext, LinkObjectTableFactory,
    LinkObjectLabelProvider
} from '@kix/core/dist/browser/link';
import { GeneralCatalogService, GeneralCatalogBrowserFactory } from '@kix/core/dist/browser/general-catalog';
import { DynamicFieldService } from '@kix/core/dist/browser/dynamic-fields';
import { TextModuleService, TextModuleBrowserFactory } from '@kix/core/dist/browser/text-modules';
import { SysConfigService } from '@kix/core/dist/browser/sysconfig';
import { SlaService, SlaLabelProvider, SlaBrowserFactory } from '@kix/core/dist/browser/sla';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.getInstance().registerServiceInstance(SearchService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(LinkService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(GeneralCatalogService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(TextModuleService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(SysConfigService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(DynamicFieldService.getInstance());
        ServiceRegistry.getInstance().registerServiceInstance(SlaService.getInstance());

        KIXObjectCache.registerCacheHandler(new LinkCacheHandler());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.GENERAL_CATALOG_ITEM, GeneralCatalogBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(KIXObjectType.TEXT_MODULE, TextModuleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SLA, SlaBrowserFactory.getInstance()
        );

        StandardTableFactoryService.getInstance().registerFactory(new LinkObjectTableFactory());

        LabelService.getInstance().registerLabelProvider(new SlaLabelProvider());
        LabelService.getInstance().registerLabelProvider(new LinkObjectLabelProvider());

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
    }

}

module.exports = Component;
