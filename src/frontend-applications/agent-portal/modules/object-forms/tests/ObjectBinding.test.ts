/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { TestFormObject } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Object Binding', () => {

    describe('Create single property bindings', () => {

        let object: TestFormObject;

        before(() => {
            object = new TestFormObject();
            object.addBinding('testProperty1', () => null);
            object.addBinding('testProperty2', () => null);
            object.addBinding('testProperty3', () => null);
            object.addBinding('testProperty4', () => null);
            object.addBinding('testProperty5', () => null);
        });

        it('should create bindings', () => {
            const bindings = object['propertyBindings'];
            expect(bindings).exist;
            expect(bindings).an('array');
            expect(bindings.length).equals(5);
        });

    });

    describe('Create multiple property bindings', () => {

        let object: TestFormObject;

        before(() => {
            object = new TestFormObject();
            object.addBinding('testProperty1', () => null);
            object.addBinding('testProperty1', () => null);
            object.addBinding('testProperty1', () => null);

            object.addBinding('testProperty2', () => null);
            object.addBinding('testProperty2', () => null);

            object.addBinding('testProperty3', () => null);
        });

        it('should create one binding for each property', () => {
            const bindings = object['propertyBindings'];
            expect(bindings).exist;
            expect(bindings).an('array');
            expect(bindings.length).equals(3);
        });

        it('PropertyBinding should contain multiple bindings', () => {
            const bindings = object['propertyBindings'];

            const property1 = bindings.find((b) => b.property === 'testProperty1');
            expect(property1).exist;
            expect(property1['elementBindings']).an('array');
            expect(property1['elementBindings'].length).equals(3);

            const property2 = bindings.find((b) => b.property === 'testProperty2');
            expect(property2).exist;
            expect(property2['elementBindings']).an('array');
            expect(property2['elementBindings'].length).equals(2);

            const property3 = bindings.find((b) => b.property === 'testProperty3');
            expect(property3).exist;
            expect(property3['elementBindings']).an('array');
            expect(property3['elementBindings'].length).equals(1);

        });
    });

    describe('Binding Callbacks', () => {

        let object: TestFormObject;

        before(() => {
            object = new TestFormObject();
        });

        it('Should call the callback if property is changed', async (done) => {
            object.addBinding('testProperty1', (newValue) => {
                expect(newValue).equals('test');
                done();
            });

            object.testProperty1 = 'test';
        });

    });

});