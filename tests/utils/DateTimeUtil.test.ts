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

    describe('betweenDays - check if the current day between the given date range', () => {

        it('Check betweenDays / d1: -1w / d2: current day / withTime: NO / withSeconds: NO / should be true', async () => {
            const d1 = new Date();
            const d2 = new Date();

            d1.setDate(d1.getDate() - 7);

            const result = DateTimeUtil.betweenDays(d1, d2);
            expect(result).true;
        });

        it('Check betweenDays / d1: -1w / d2: -1d / withTime: NO / withSeconds: NO / should be false', async () => {
            const d1 = new Date();
            const d2 = new Date();

            d1.setDate(d1.getDate() - 7);
            d2.setDate(d2.getDate() - 1);

            const result = DateTimeUtil.betweenDays(d1, d2);
            expect(result).false;
        });

        it('Check betweenDays / d1: -1d / d2: +2d / withTime: YES / withSeconds: NO / should be true', async () => {
            const d1 = new Date();
            const d2 = new Date();

            d1.setDate(d1.getDate() - 1);
            d2.setDate(d2.getDate() + 2);

            const result = DateTimeUtil.betweenDays(d1, d2);
            expect(result, `${d1} - ${d2}`).true;
        });

        it('Check betweenDays / d1: -1d / d2: +1d / withTime: YES / withSeconds: YES / should be true', async () => {
            const d1 = new Date();
            const d2 = new Date();

            d1.setDate(d1.getDate() - 1);
            d2.setDate(d2.getDate() + 1);

            const result = DateTimeUtil.betweenDays(d1, d2);
            expect(result).true;
        });
    });

});