/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { CRUD } from '../../../../../server/model/rest/CRUD';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ServiceType } from '../../base-components/webapp/core/ServiceType';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../base-components/webapp/core/table';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { CMDBReadUIModule, CMDBService, ConfigItemFormService, ConfigItemVersionTableFactory, CompareConfigItemVersionTableFactory, ConfigItemHistoryTableFactory, ConfigItemLabelProvider, ConfigItemClassLabelProvider, ConfigItemClassDefinitionLabelProvider, ConfigItemHistoryLabelProvider, ConfigItemVersionLabelProvider, ConfigItemVersionCompareLabelProvider, ConfigItemSearchDefinition, CMDBContext, ConfigItemDetailsContext, ConfigItemSearchContext, CompareConfigItemVersionContext, ConfigItemTableFactory } from '../webapp/core';
import { SearchService } from '../../search/webapp/core';
import { PostproductivCSSHandler } from '../webapp/core/table/PostproductivCSSHandler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('CMDBReadUIModule', () => {

    let cmdbAdminModule: CMDBReadUIModule;

    before(() => {
        cmdbAdminModule = new CMDBReadUIModule();
    });

    describe('Should register the admin module for cmdb', () => {

        it('should register', async () => {
            await cmdbAdminModule.register();
        });

        describe('check ConfigItem', () => {
            it('should register CMDBService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.CONFIG_ITEM);
                expect(service).exist;
                expect(service).instanceof(CMDBService);
            });

            it('should register ConfigItemFormService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.CONFIG_ITEM, ServiceType.FORM);
                expect(service).exist;
                expect(service).instanceof(ConfigItemFormService);
            });

            it('should register ConfigItemTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.CONFIG_ITEM);
                expect(factory).exist;
                expect(factory).instanceof(ConfigItemTableFactory);
            });

            it('should register ConfigItemVersionTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.CONFIG_ITEM_VERSION);
                expect(factory).exist;
                expect(factory).instanceof(ConfigItemVersionTableFactory);
            });

            it('should register CompareConfigItemVersionTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.CONFIG_ITEM_VERSION_COMPARE);
                expect(factory).exist;
                expect(factory).instanceof(CompareConfigItemVersionTableFactory);
            });

            it('should register ConfigItemHistoryTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.CONFIG_ITEM_HISTORY);
                expect(factory).exist;
                expect(factory).instanceof(ConfigItemHistoryTableFactory);
            });

            it('should register ConfigItemLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemLabelProvider);
            });

            it('should register ConfigItemClassLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_CLASS);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemClassLabelProvider);
            });

            it('should register ConfigItemClassDefinitionLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemClassDefinitionLabelProvider);
            });

            it('should register ConfigItemHistoryLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_HISTORY);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemHistoryLabelProvider);
            });

            it('should register ConfigItemVersionLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_VERSION);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemVersionLabelProvider);
            });

            it('should register ConfigItemVersionCompareLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_VERSION_COMPARE);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemVersionCompareLabelProvider);
            });

            it('should register the search definition for config item', () => {
                const definition = SearchService.getInstance().getSearchDefinition(KIXObjectType.CONFIG_ITEM);
                expect(definition).exist;
                expect(definition).instanceof(ConfigItemSearchDefinition);
            });

            it('should register the css handler for postproductive config items', () => {
                const handler = TableCSSHandlerRegistry.getObjectCSSHandler(KIXObjectType.CONFIG_ITEM);
                expect(handler).exist;
                expect(handler).an('array');
                expect(handler.length).equals(1);
                expect(handler[0]).instanceof(PostproductivCSSHandler);
            });

            it('should register the dashboard context for ConfigItem', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(CMDBContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });

            it('should register the details context for ConfigItem', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(ConfigItemDetailsContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });

            it('should register the search context for ConfigItem', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(ConfigItemSearchContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });

            it('should register the compare context for ConfigItem', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(CompareConfigItemVersionDialogContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });

            it('should register the ConfigItemVersionCompareAction', () => {
                expect(ActionFactory.getInstance().hasAction('config-item-version-compare-action')).true;
            });

        });

    });

});
