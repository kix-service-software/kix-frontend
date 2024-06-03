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
import { CommonPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/CommonPlaceholderHandler';
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for common types', () => {

    let commonPlaceholderHandler: CommonPlaceholderHandler = new CommonPlaceholderHandler();

    describe('Replace NOW placeholder.', async () => {

        it('Should replace simple placeholder', async () => {
            const text = await commonPlaceholderHandler.replace(`<KIX_NOW>`);
            expect(text).equal(DateTimeUtil.getKIXDateTimeString(new Date()));
        });

        it('Should replace DateTime placeholder', async () => {
            const text = await commonPlaceholderHandler.replace(`<KIX_NOW_DateTime>`);
            expect(text).equal(DateTimeUtil.getKIXDateTimeString(new Date()));
        });

        it('Should replace Date placeholder', async () => {
            const text = await commonPlaceholderHandler.replace(`<KIX_NOW_Date>`);
            expect(text).equal(DateTimeUtil.getKIXDateString(new Date()));
        });

        it('Should replace Time placeholder', async () => {
            const text = await commonPlaceholderHandler.replace(`<KIX_NOW_Time>`);
            expect(text).equal(DateTimeUtil.getKIXTimeString(new Date(), false));
        });
    });

    describe('Replace unknown or wrong NOW placeholder with empty string.', async () => {

        it('Should replace wrong (missing attribute) placeholder', async () => {
            const text = await commonPlaceholderHandler.replace(`<KIX_NOW_>`);
            expect(text).equal('');
        });

        it('Should replace unknown  placeholder', async () => {
            const text = await commonPlaceholderHandler.replace(`<KIX_NOW_Day>`);
            expect(text).equal('');
        });
    });

});
