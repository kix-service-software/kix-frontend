/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { InMemoryCache } from '../../src/core/cache';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Cache / InMemoryCache', () => {

    before(async () => {
        require('../TestSetup');
    });

    describe('set cache values', () => {

        afterEach(async () => {
            await InMemoryCache.getInstance().clear();
        });

        it('should set a value to the cache', async () => {
            InMemoryCache.getInstance().set('testKey', 'testPrefix', 'testValue');
            const value = await InMemoryCache.getInstance().get('testKey');
            expect(value).not.undefined;
            expect(value).equals('testValue');
        });

        it('should set multiple values to the cache', async () => {
            InMemoryCache.getInstance().set('testKey0', 'testPrefix', 'testValue0');
            InMemoryCache.getInstance().set('testKey1', 'testPrefix', 'testValue1');
            const value0 = await InMemoryCache.getInstance().get('testKey0');
            expect(value0).not.undefined;
            expect(value0).equals('testValue0');

            const value1 = await InMemoryCache.getInstance().get('testKey1');
            expect(value1).not.undefined;
            expect(value1).equals('testValue1');
        });

        it('should set multiple values to the cache for different prefixes', async () => {
            InMemoryCache.getInstance().set('testKey0', 'testPrefix0', 'testValue0');
            InMemoryCache.getInstance().set('testKey1', 'testPrefix1', 'testValue1');
            const value0 = await InMemoryCache.getInstance().get('testKey0');
            expect(value0).not.undefined;
            expect(value0).equals('testValue0');

            const value1 = await InMemoryCache.getInstance().get('testKey1');
            expect(value1).not.undefined;
            expect(value1).equals('testValue1');
        });

        it('should set multiple values to the cache for different prefixes', async () => {
            InMemoryCache.getInstance().set('testKey0', 'testPrefix0', 'testValue0');
            InMemoryCache.getInstance().set('testKey1', 'testPrefix1', 'testValue1');

            const value0 = await InMemoryCache.getInstance().has('testKey0');
            expect(value0).true;

            const value1 = await InMemoryCache.getInstance().has('testKey1');
            expect(value1).true;
        });
    });

    describe('delete cache values', () => {

        afterEach(async () => {
            await InMemoryCache.getInstance().clear();
        });

        it('should delete a single key', async () => {
            InMemoryCache.getInstance().set('testKeyA', 'prefix', 'testValueA');
            InMemoryCache.getInstance().set('testKeyB', 'prefix', 'testValueB');

            await InMemoryCache.getInstance().delete('testKeyA', 'prefix');

            const hasValueA = await InMemoryCache.getInstance().has('testKeyA');
            expect(hasValueA).false;

            const hasValueB = await InMemoryCache.getInstance().has('testKeyB');
            expect(hasValueB).true;
        });

        it('should delete keys for a given prefix', async () => {
            InMemoryCache.getInstance().set('testKeyA', 'prefix', 'testValueA');
            InMemoryCache.getInstance().set('testKeyB', 'prefix', 'testValueB');
            InMemoryCache.getInstance().set('testKeyA1', 'prefix1', 'testValueA1');
            InMemoryCache.getInstance().set('testKeyB1', 'prefix1', 'testValueB1');

            await InMemoryCache.getInstance().deleteKeys('prefix');

            const hasValueA = await InMemoryCache.getInstance().has('testKeyA');
            expect(hasValueA).false;
            const hasValueB = await InMemoryCache.getInstance().has('testKeyB');
            expect(hasValueB).false;

            const hasValueA1 = await InMemoryCache.getInstance().has('testKeyA1');
            expect(hasValueA1).true;
            const hasValueB1 = await InMemoryCache.getInstance().has('testKeyB1');
            expect(hasValueB1).true;
        });
    });

});

