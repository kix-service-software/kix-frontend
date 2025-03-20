/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { FAQAdminUIModule, FAQCategoryLabelProvider, FAQCategoryTableFactory, FAQCategoryFormService } from '../webapp/core';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../table/webapp/core/factory/TableFactoryService';
import { ServiceType } from '../../base-components/webapp/core/ServiceType';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { CRUD } from '../../../../../server/model/rest/CRUD';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('FAQAdminUIModule', () => {

    let faqAdminModule: FAQAdminUIModule;

    before(() => {
        faqAdminModule = new FAQAdminUIModule();
        (faqAdminModule as any).checkPermissions = async (resource: string, crud: CRUD): Promise<boolean> => {
            return true;
        };
    });

    describe('Should register the admin module for faq', () => {

        it('should register', async () => {
            await faqAdminModule.register();
        });

        it('should register the context for NewFAQCategoryDialogContext', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(NewFAQCategoryDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register the context for EditFAQCategoryDialogContext', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(EditFAQCategoryDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register the context for FAQCategoryDetailsContext', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(FAQCategoryDetailsContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register FAQCategoryEditAction', () => {
            expect(ActionFactory.getInstance().hasAction('faq-admin-category-edit-action')).true;
        });

        it('should register FAQCategoryCreateAction', () => {
            expect(ActionFactory.getInstance().hasAction('faq-admin-category-create-action')).true;
        });

        it('Should register the FAQCategoryLabelProvider', () => {
            const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.FAQ_CATEGORY);
            expect(provider).exist;
            expect(provider).instanceof(FAQCategoryLabelProvider);
        });

        it('Should register the FAQCategoryTableFactory', () => {
            const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.FAQ_CATEGORY);
            expect(factory).exist;
            expect(factory).instanceof(FAQCategoryTableFactory);
        });

        it('Should register the FAQCategoryFormService', () => {
            const service = ServiceRegistry.getServiceInstance(KIXObjectType.FAQ_CATEGORY, ServiceType.FORM);
            expect(service).exist;
            expect(service).instanceof(FAQCategoryFormService);
        });

    });

});