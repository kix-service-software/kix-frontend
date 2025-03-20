/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { FAQArticle } from '../model/FAQArticle';
import { FAQDetailsContext } from '../webapp/core/context/FAQDetailsContext';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('FAQDetailsContext', () => {

    let originalFunction;
    let context: FAQDetailsContext;

    before(() => {
        originalFunction = KIXObjectService.loadObjects;

        KIXObjectService.loadObjects = async <T extends KIXObject>(objectType: KIXObjectType): Promise<T[]> => {
            if (objectType === KIXObjectType.FAQ_ARTICLE) {
                const faqArticle = new FAQArticle();
                faqArticle.ID = 123;
                faqArticle.Title = 'TestFAQ';
                return [faqArticle] as any;
            }
        };

        context = new FAQDetailsContext(null, 123);
    });

    after(() => {
        KIXObjectService.loadObjects = originalFunction;
    });

    describe('Get FAQArticle from context', () => {

        let faqArticle: FAQArticle;

        before(async () => {
            faqArticle = await context.getObject<FAQArticle>();
        });

        it('Should get the object', () => {
            expect(faqArticle).exist;
        });

        it('Should get the Id', () => {
            expect(faqArticle.ID).exist;
            expect(faqArticle.ID).equals(123);
        });

        it('Should get the correct Title', () => {
            expect(faqArticle.Title).exist;
            expect(faqArticle.Title).equals('TestFAQ');
        });

    });

});