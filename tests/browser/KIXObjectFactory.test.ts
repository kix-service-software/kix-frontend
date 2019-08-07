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
import { KIXObjectFactory } from '../../src/core/browser';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('KIXObjectFactory', () => {

    describe('Cleanup properties for target object with given source object', () => {
        const targetObject = {
            prop1: 'prop1',
            prop2: 'prop1',
            prop3: 'prop1',
            prop4: 'prop1',
            prop5: 'prop1',
        };

        const sourceObject = {
            prop3: 'prop3',
            prop5: 'prop5'
        }

        it('Target should have only properties which where contained in source object.', () => {
            const factory = TestFactory.getInstance();
            expect(factory).exist;
            const cleanupObject = factory.cleanupProperties(targetObject, sourceObject);
            expect(cleanupObject.hasOwnProperty('prop1')).false;
            expect(cleanupObject.hasOwnProperty('prop2')).false;
            expect(cleanupObject.hasOwnProperty('prop3')).true;
            expect(cleanupObject.hasOwnProperty('prop4')).false;
            expect(cleanupObject.hasOwnProperty('prop5')).true;
        });
    });

});

class TestFactory extends KIXObjectFactory<any> {

    private static INSTANCE: TestFactory;

    public static getInstance(): TestFactory {
        if (!TestFactory.INSTANCE) {
            TestFactory.INSTANCE = new TestFactory();
        }
        return TestFactory.INSTANCE;
    }

    protected constructor() {
        super();
    }

    public create(object: any): Promise<any> {
        return object;
    }

}