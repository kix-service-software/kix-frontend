import {
    AbstractMarkoComponent, ContextService, ActionFactory, KIXObjectSearchService,
    LabelService, FactoryService, ServiceRegistry, TableFactoryService
} from '../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    ContextDescriptor, KIXObjectType, ContextMode, ContextType,
    ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from '../../../core/model';
import {
    CMDBContext, NewConfigItemDialogContext, ConfigItemDetailsContext, ConfigItemSearchContext,
    ConfigItemSearchDefinition, ConfigItemVersionLabelProvider, ConfigItemVersionTableFactory,
    ConfigItemLabelProvider, ConfigItemHistoryLabelProvider, ConfigItemTableFactory, ConfigItemImageBrowserFactory,
    ConfigItemClassBrowserFactory, ConfigItemBrowserFactory, CMDBService, ConfigItemVersionMaximizeAction,
    ConfigItemCreateAction, ConfigItemEditAction, ConfigItemPrintAction, ConfigItemVersionCompareAction,
    EditConfigItemDialogContext, ConfigItemFormService, ConfigItemClassLabelProvider, ConfigItemClassTableFactory,
    ConfigItemClassCreateAction, ConfigItemClassImportAction, ConfigItemClassDetailsContext, ConfigItemClassEditAction,
    ConfigItemClassDefinitionTableFactory, ConfigItemClassDefinitionLabelProvider, NewConfigItemClassDialogContext,
    ConfigItemClassService,
    EditConfigItemClassDialogContext,
    ConfigItemClassFormService,
    ConfigItemHistoryTableFactory,
    CompareConfigItemVersionDialogContext,
    CompareConfigItemVersionTableFactory,
    ConfigItemVersionCompareLabelProvider
} from '../../../core/browser/cmdb';
import { DialogService } from '../../../core/browser/components/dialog';

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
        this.registerAdminContexts();
        this.registerDialogs();
        this.registerAdminDialogs();
        this.registerActions();
        this.registerAdminActions();
    }

    private registerContexts(): void {
        const cmdbContext = new ContextDescriptor(
            CMDBContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'cmdb-module', ['configitems'], CMDBContext
        );
        ContextService.getInstance().registerContext(cmdbContext);

        const newConfigItemDialogContext = new ContextDescriptor(
            NewConfigItemDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-config-item-dialog', ['configitems'], NewConfigItemDialogContext
        );
        ContextService.getInstance().registerContext(newConfigItemDialogContext);

        const configItemDetailsContext = new ContextDescriptor(
            ConfigItemDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DETAILS,
            true, 'config-item-details', ['configitems'], ConfigItemDetailsContext
        );
        ContextService.getInstance().registerContext(configItemDetailsContext);

        const editConfigItemContext = new ContextDescriptor(
            EditConfigItemDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-config-item-dialog', ['configitems'], EditConfigItemDialogContext
        );
        ContextService.getInstance().registerContext(editConfigItemContext);

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

    private registerAdminContexts(): void {
        const configItemClassDetailsContext = new ContextDescriptor(
            ConfigItemClassDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'config-item-class-details', ['configitemclasses'], ConfigItemClassDetailsContext
        );
        ContextService.getInstance().registerContext(configItemClassDetailsContext);

        const newConfigItemClassDetailsContext = new ContextDescriptor(
            NewConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            true, 'new-config-item-class-dialog', ['configitemclasses'], NewConfigItemClassDialogContext
        );
        ContextService.getInstance().registerContext(newConfigItemClassDetailsContext);

        const editConfigItemClassDetailsContext = new ContextDescriptor(
            EditConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            true, 'edit-config-item-class-dialog', ['configitemclasses'], EditConfigItemClassDialogContext
        );
        ContextService.getInstance().registerContext(editConfigItemClassDetailsContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-config-item-dialog',
            new WidgetConfiguration(
                'new-config-item-dialog', 'Translatable#New Config Item', [], {}, false, false, null, 'kix-icon-new-ci'
            ),
            KIXObjectType.CONFIG_ITEM,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-config-item-dialog',
            new WidgetConfiguration(
                'edit-config-item-dialog', 'Translatable#Edit Config Item', [], {}, false, false, null, 'kix-icon-edit'
            ),
            KIXObjectType.CONFIG_ITEM,
            ContextMode.EDIT
        ));

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

    private registerAdminDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-config-item-class-dialog',
            new WidgetConfiguration(
                'new-config-item-class-dialog', 'Translatable#New Class', [], {}, false, false, null,
                'kix-icon-new-gear'
            ),
            KIXObjectType.CONFIG_ITEM_CLASS,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-config-item-class-dialog',
            new WidgetConfiguration(
                'edit-config-item-class-dialog', 'Translatable#Edit Class', [], {},
                false, false, null, 'kix-icon-gear'
            ),
            KIXObjectType.CONFIG_ITEM_CLASS,
            ContextMode.EDIT_ADMIN
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction(
            'config-item-version-maximize-action', ConfigItemVersionMaximizeAction
        );
        ActionFactory.getInstance().registerAction('config-item-create-action', ConfigItemCreateAction);
        ActionFactory.getInstance().registerAction('config-item-edit-action', ConfigItemEditAction);
        ActionFactory.getInstance().registerAction('config-item-print-action', ConfigItemPrintAction);
        ActionFactory.getInstance().registerAction(
            'config-item-version-compare-action', ConfigItemVersionCompareAction
        );
    }

    private registerAdminActions(): void {
        ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-create', ConfigItemClassCreateAction);
        ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-import', ConfigItemClassImportAction);
        ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-edit', ConfigItemClassEditAction);
    }

}

module.exports = Component;
