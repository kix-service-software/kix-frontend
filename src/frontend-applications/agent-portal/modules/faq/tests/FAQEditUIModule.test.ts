/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
    FAQEditUIModule, EditFAQArticleDialogContext, NewFAQArticleDialogContext
} from '../webapp/core';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { CRUD } from '../../../../../server/model/rest/CRUD';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('FAQEditUIModule', () => {

    let faqAdminModule: FAQEditUIModule;

    before(() => {
        faqAdminModule = new FAQEditUIModule();
        (faqAdminModule as any).checkPermissions = async (resource: string, crud: CRUD): Promise<boolean> => {
            return true;
        };
    });

    describe('Should register the edit module for faq', () => {

        it('should register', async () => {
            await faqAdminModule.register();
        });

        it('should register the context for NewFAQArticleDialogContext', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(NewFAQArticleDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register the context for EditFAQArticleDialogContext', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(EditFAQArticleDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register FAQArticleCreateAction', () => {
            expect(ActionFactory.getInstance().hasAction('faq-article-create-action')).true;
        });

        it('should register FAQArticleDeleteAction', () => {
            expect(ActionFactory.getInstance().hasAction('faq-article-delete-action')).true;
        });

        it('should register FAQArticleEditAction', () => {
            expect(ActionFactory.getInstance().hasAction('faq-article-edit-action')).true;
        });

    });

});