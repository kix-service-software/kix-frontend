import {
    AbstractMarkoComponent, ServiceRegistry, FactoryService, LabelService,
    TableFactoryService, ContextService, DialogService, ActionFactory
} from "../../../../core/browser";
import { ComponentState } from './ComponentState';
import {
    CMDBService, ConfigItemClassService, ConfigItemBrowserFactory, ConfigItemClassBrowserFactory,
    ConfigItemImageBrowserFactory, ConfigItemTableFactory, ConfigItemVersionTableFactory,
    CompareConfigItemVersionTableFactory, ConfigItemClassTableFactory, ConfigItemClassDefinitionTableFactory,
    ConfigItemHistoryTableFactory, ConfigItemLabelProvider, ConfigItemClassLabelProvider,
    ConfigItemHistoryLabelProvider, ConfigItemVersionLabelProvider, ConfigItemClassDefinitionLabelProvider,
    ConfigItemVersionCompareLabelProvider, ConfigItemSearchDefinition, CMDBContext, ConfigItemDetailsContext,
    ConfigItemSearchContext, CompareConfigItemVersionDialogContext, ConfigItemPrintAction,
    ConfigItemVersionCompareAction, ConfigItemClassFormService, ConfigItemFormService, ConfigItemHistoryBrowserFactory
} from "../../../../core/browser/cmdb";
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from "../../../../core/model";
import { KIXObjectSearchService } from "../../../../core/browser/kix/search/KIXObjectSearchService";

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(CMDBService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemClassService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemClassFormService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM, ConfigItemBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM_HISTORY, ConfigItemHistoryBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM_CLASS, ConfigItemClassBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM_IMAGE, ConfigItemImageBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new ConfigItemTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemVersionTableFactory());
        TableFactoryService.getInstance().registerFactory(new CompareConfigItemVersionTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemClassTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemClassDefinitionTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new ConfigItemLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemVersionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassDefinitionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemVersionCompareLabelProvider());

        KIXObjectSearchService.getInstance().registerSearchDefinition(new ConfigItemSearchDefinition());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const cmdbContext = new ContextDescriptor(
            CMDBContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'cmdb-module', ['configitems'], CMDBContext
        );
        ContextService.getInstance().registerContext(cmdbContext);

        const configItemDetailsContext = new ContextDescriptor(
            ConfigItemDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitems'], ConfigItemDetailsContext
        );
        ContextService.getInstance().registerContext(configItemDetailsContext);

        const searchConfigItemContext = new ContextDescriptor(
            ConfigItemSearchContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-config-item-dialog', ['configitems'], ConfigItemSearchContext
        );
        ContextService.getInstance().registerContext(searchConfigItemContext);

        const compareConfigItemContext = new ContextDescriptor(
            CompareConfigItemVersionDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_VERSION_COMPARE],
            ContextType.DIALOG, ContextMode.EDIT,
            false, 'compare-config-item-version-dialog', ['configitems'], CompareConfigItemVersionDialogContext
        );
        ContextService.getInstance().registerContext(compareConfigItemContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-config-item-dialog',
            new WidgetConfiguration(
                'search-config-item-dialog', 'Translatable#Config Item Search', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-search-ci'
            ),
            KIXObjectType.CONFIG_ITEM,
            ContextMode.SEARCH
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'compare-config-item-version-dialog',
            new WidgetConfiguration(
                'compare-config-item-version-dialog', 'Translatable#Compare Versions', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-comparison-version'
            ),
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE,
            ContextMode.EDIT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('config-item-print-action', ConfigItemPrintAction);
        ActionFactory.getInstance().registerAction(
            'config-item-version-compare-action', ConfigItemVersionCompareAction
        );
    }

}

module.exports = Component;
