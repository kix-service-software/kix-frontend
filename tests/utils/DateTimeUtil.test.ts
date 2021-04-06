/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DateTimeUtil', () => {

    describe('getLocalDateString', () => {

        it('Should give the data in english format', async () => {
            const localeDate = await DateTimeUtil.getLocalDateString('2020-01-01 10:00', 'en-GB');
            expect(localeDate).equals('01/01/2020');
        });

        // it('Should give the data in german format', async () => {
        //     const localeDate = await DateTimeUtil.getLocalDateString('2020-01-01 10:00', 'de-DE');
        //     expect(localeDate).equals('01.01.2020');
        // });

    });

});