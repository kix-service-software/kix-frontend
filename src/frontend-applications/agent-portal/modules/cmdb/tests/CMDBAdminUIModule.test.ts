/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import {
    CMDBAdminUIModule, ConfigItemClassService, ConfigItemClassFormService, ConfigItemClassTableFactory, ConfigItemClassDefinitionTableFactory, ConfigItemClassLabelProvider, ConfigItemClassDefinitionLabelProvider, NewConfigItemClassDialogContext, EditConfigItemClassDialogContext, ConfigItemClassDetailsContext
} from '../webapp/core';
import { CRUD } from '../../../../../server/model/rest/CRUD';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ServiceType } from '../../base-components/webapp/core/ServiceType';
import { TableFactoryService } from '../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('CMDBAdminUIModule', () => {

    let cmdbAdminModule: CMDBAdminUIModule;

    before(() => {
        cmdbAdminModule = new CMDBAdminUIModule();
        (cmdbAdminModule as any).checkPermission = async (resource: string, crud: CRUD): Promise<boolean> => {
            return true;
        };
    });

    describe('Should register the admin module for cmdb', () => {

        it('should register', async () => {
            await cmdbAdminModule.register();
        });

        describe('check ConfigItemClass', () => {
            it('should register ConfigItemClassService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.CONFIG_ITEM_CLASS);
                expect(service).exist;
                expect(service).instanceof(ConfigItemClassService);
            });

            it('should register ConfigItemClassFormService', () => {
                const service = ServiceRegistry.getServiceInstance(KIXObjectType.CONFIG_ITEM_CLASS, ServiceType.FORM);
                expect(service).exist;
                expect(service).instanceof(ConfigItemClassFormService);
            });

            it('should register ConfigItemClassTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.CONFIG_ITEM_CLASS);
                expect(factory).exist;
                expect(factory).instanceof(ConfigItemClassTableFactory);
            });

            it('should register ConfigItemClassLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_CLASS);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemClassLabelProvider);
            });

            it('should register the details context for ConfigItemClass', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(ConfigItemClassDetailsContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });
        });

        describe('Check ConfigItemClassDefinition', () => {
            it('should register ConfigItemClassDefinitionTableFactory', () => {
                const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION);
                expect(factory).exist;
                expect(factory).instanceof(ConfigItemClassDefinitionTableFactory);
            });

            it('should register ConfigItemClassDefinitionLabelProvider', () => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION);
                expect(labelProvider).exist;
                expect(labelProvider).instanceof(ConfigItemClassDefinitionLabelProvider);
            });
        });

        describe('Check ConfigItemClass create', () => {
            it('should register ConfigItemClassCreateAction', () => {
                expect(ActionFactory.getInstance().hasAction('cmdb-admin-ci-class-create')).true;
            });

            it('should register the new context for ConfigItemClass', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(NewConfigItemClassDialogContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });
        });

        describe('Check ConfigItemClass edit', () => {
            it('should register ConfigItemClassEditAction', () => {
                expect(ActionFactory.getInstance().hasAction('cmdb-admin-ci-class-edit')).true;
            });

            it('should register the edit context for ConfigItemClass', () => {
                // const descriptor = ContextService.getInstance().getContextDescriptor(EditConfigItemClassDialogContext.CONTEXT_ID);
                // expect(descriptor).exist;
            });
        });

    });

});
