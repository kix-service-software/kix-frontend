/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ObjectFormValue } from '../model/FormValues/ObjectFormValue';
import { TestFormObject, TestObjectValueMapper } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ObjectFormValueMapper', () => {

    describe('Map the object properties to form values', () => {

        const objectValueMapper = new TestObjectValueMapper();

        before(async () => {
            await objectValueMapper.mapFormValues(new TestFormObject());
        });

        it('should have form values for each property', () => {
            const formValues = (objectValueMapper as any).formValues as ObjectFormValue[];
            expect(formValues).exist;
            expect(formValues).an('array');

            const property1 = objectValueMapper.findFormValue('testProperty1');
            expect(property1).exist;

            const property2 = objectValueMapper.findFormValue('testProperty2');
            expect(property2).exist;

            const property3 = objectValueMapper.findFormValue('testProperty3');
            expect(property3).exist;

            const property4 = objectValueMapper.findFormValue('testProperty4');
            expect(property4).exist;

            const property5 = objectValueMapper.findFormValue('testProperty5');
            expect(property5).exist;
        });

    });

});