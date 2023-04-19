/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    CMDBContext,
    CMDBService,
    CompareConfigItemVersionContext,
    CompareConfigItemVersionTableFactory,
    ConfigItemClassDefinitionLabelProvider,
    ConfigItemClassLabelProvider,
    ConfigItemDetailsContext,
    ConfigItemFormService,
    ConfigItemHistoryLabelProvider,
    ConfigItemHistoryTableFactory,
    ConfigItemLabelProvider,
    ConfigItemSearchContext,
    ConfigItemSearchDefinition,
    ConfigItemTableFactory,
    ConfigItemVersionCompareAction,
    ConfigItemVersionCompareLabelProvider,
    ConfigItemVersionLabelProvider,
    ConfigItemVersionTableFactory
} from '.';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextType } from '../../../../model/ContextType';
import { IUIModule } from '../../../../model/IUIModule';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { ActionFactory } from '../../../base-components/webapp/core/ActionFactory';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { GraphService } from '../../../graph/webapp/core/GraphService';
import { SearchService } from '../../../search/webapp/core';
import { TableCSSHandlerRegistry } from '../../../table/webapp/core/css-handler/TableCSSHandlerRegistry';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import ConfigItemPrintAction from './actions/ConfigItemPrintAction';
import ConfigItemPrintSelectionAction from './actions/ConfigItemPrintSelectionAction';
import { CMDBGraphInstance } from './CMDBGraphInstance';
import { PostproductivCSSHandler } from './table/PostproductivCSSHandler';

export class UIModule implements IUIModule {

    public name: string = 'CMDBReadUIModule';

    public priority: number = 200;

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(CMDBService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new ConfigItemTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemVersionTableFactory());
        TableFactoryService.getInstance().registerFactory(new CompareConfigItemVersionTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new ConfigItemLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassDefinitionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemVersionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemVersionCompareLabelProvider());

        SearchService.getInstance().registerSearchDefinition(new ConfigItemSearchDefinition());

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.CONFIG_ITEM, new PostproductivCSSHandler()
        );

        GraphService.registerGraphInstance('ConfigItemLinkGraph', CMDBGraphInstance);

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const cmdbContext = new ContextDescriptor(
            CMDBContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'cmdb-module', ['configitems'], CMDBContext
        );
        ContextService.getInstance().registerContext(cmdbContext);

        const configItemDetailsContext = new ContextDescriptor(
            ConfigItemDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitems'], ConfigItemDetailsContext,
            [
                new UIComponentPermission('cmdb/configitems', [CRUD.READ])
            ],
            'Translatable#Bulk', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(configItemDetailsContext);

        const searchConfigItemContext = new ContextDescriptor(
            ConfigItemSearchContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.SEARCH,
            false, 'search', ['configitems'], ConfigItemSearchContext,

            [
                new UIComponentPermission('cmdb/configitems', [CRUD.READ])
            ],
            'Translatable#Asset', 'kix-icon-ci', null, 200
        );
        ContextService.getInstance().registerContext(searchConfigItemContext);

        const compareConfigItemContext = new ContextDescriptor(
            CompareConfigItemVersionContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_VERSION_COMPARE],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'compare-config-item-version-dialog', ['versioncompare'], CompareConfigItemVersionContext,
            [
                new UIComponentPermission('cmdb/configitems', [CRUD.READ])
            ],
            'Translatable#Compare Asset Versions', 'kix-icon-gear'
        );
        ContextService.getInstance().registerContext(compareConfigItemContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction(
            'config-item-version-compare-action', ConfigItemVersionCompareAction
        );
        ActionFactory.getInstance().registerAction('config-item-print-action', ConfigItemPrintAction);
        ActionFactory.getInstance().registerAction('config-item-print-selection-action', ConfigItemPrintSelectionAction);
    }

}
