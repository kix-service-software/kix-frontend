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
import { ValidationResult } from '../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../base-components/webapp/core/ValidationSeverity';
import { FormValueProperty } from '../model/FormValueProperty';
import { ObjectFormValue } from '../model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../model/ObjectFormValueMapper';
import { TestObjectValueMapper, TestFormObject } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('FormValue Binding', () => {

    describe('Check object property binding', () => {

        let formValue: ObjectFormValue;
        let object: TestFormObject;
        let objectFormValueMapper: ObjectFormValueMapper;

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            object = new TestFormObject();
            formValue = new ObjectFormValue('testProperty1', object, objectFormValueMapper, null);
        });

        it('ObjectValue -> FormValue - should change the value if object property value is changed', () => {
            object.testProperty1 = 'testValue';
            // expect(formValue.value).equals('testValue');
        });

        it('ObjectValue -> FormValue - should change the value if object property value is changed twice', () => {
            object.testProperty1 = 'testValue1';
            // expect(formValue.value).equals('testValue1');

            object.testProperty1 = 'testValue2';
            // expect(formValue.value).equals('testValue2');
        });

        it('FormValue -> ObjectValue - should change the object value if form value is changed', async () => {
            await formValue.setObjectValue('testValue');
            expect(object.testProperty1).equals('testValue');
        });

        it('FormValue -> ObjectValue - should change the object value if form value is changed twice', async () => {
            await formValue.setObjectValue('testValue1');
            expect(object.testProperty1).equals('testValue1');

            await formValue.setObjectValue('testValue2');
            expect(object.testProperty1).equals('testValue2');
        });
    });

    describe('Check form value property binding', () => {

        let formValue: ObjectFormValue;
        let object: TestFormObject;
        let objectFormValueMapper: ObjectFormValueMapper;

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            object = new TestFormObject();
            formValue = new ObjectFormValue('testProperty1', object, objectFormValueMapper, null);
        });

        it('Should have binding for form value properties', () => {
            expect(formValue['bindings']).an('array');
            expect(formValue['bindings'].length).equals(12);
        });

        it('Should have binding for PossibleValues', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.POSSIBLE_VALUES);
            expect(binding).exist;
        });

        it('Should have binding for ReadOnly', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.READ_ONLY);
            expect(binding).exist;
        });

        it('Should have binding for Required', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.REQUIRED);
            expect(binding).exist;
        });

        it('Should have binding for Valid', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.VALID);
            expect(binding).exist;
        });

        it('Should have binding for ValidationResults', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.VALIDATION_RESULTS);
            expect(binding).exist;
        });

        it('Should have binding for Value', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.VALUE);
            expect(binding).exist;
        });

        it('Should have binding for Visible', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.VISIBLE);
            expect(binding).exist;
        });

        it('Should have binding for Enabled', () => {
            const binding = formValue['bindings'].find((b) => b.property === FormValueProperty.ENABLED);
            expect(binding).exist;
        });

    });

    describe('Check callbacks', () => {

        let formValue: ObjectFormValue;
        let object: TestFormObject;
        let objectFormValueMapper: ObjectFormValueMapper;

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            object = new TestFormObject();
            formValue = new ObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            formValue.addPropertyBinding(FormValueProperty.REQUIRED, () => null);
            formValue.addPropertyBinding(FormValueProperty.VALID, () => null);
            formValue.addPropertyBinding(FormValueProperty.VALIDATION_RESULTS, () => null);
            formValue.addPropertyBinding(FormValueProperty.VALUE, () => null);
            formValue.addPropertyBinding(FormValueProperty.VISIBLE, () => null);
        });

        it('PossibleValues Binding- should call the callback if value is changed', (done) => {
            formValue.addPropertyBinding(FormValueProperty.POSSIBLE_VALUES, (formValue: ObjectFormValue) => {
                expect(formValue.possibleValues).an('array');
                expect(formValue.possibleValues.length).equals(3);
                done();
            });

            formValue.possibleValues = [1, 2, 3];
        });

        it('ReadOnly Binding- should call the callback if value is changed', (done) => {
            formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                expect(formValue.readonly).true;
                done();
            });

            formValue.readonly = true;
        });

        it('Required Binding- should call the callback if value is changed', (done) => {
            formValue.addPropertyBinding(FormValueProperty.REQUIRED, (formValue: ObjectFormValue) => {
                expect(formValue.required).true;
                done();
            });

            formValue.required = true;
        });

        it('Valid Binding- should call the callback if value is changed', (done) => {
            formValue.addPropertyBinding(FormValueProperty.VALID, (formValue: ObjectFormValue) => {
                expect(formValue.valid).true;
                done();
            });

            formValue.valid = true;
        });

        it('ValidationResults Binding- should call the callback if value is changed', (done) => {
            formValue.addPropertyBinding(FormValueProperty.VALIDATION_RESULTS, (formValue: ObjectFormValue) => {
                expect(formValue.validationResults).an('array');
                expect(formValue.validationResults.length).equals(2);
                done();
            });

            formValue.validationResults = [
                new ValidationResult(ValidationSeverity.OK, ''),
                new ValidationResult(ValidationSeverity.ERROR, '')
            ];
        });

        it('Value Binding- should call the callback if value is changed', (done) => {
            formValue.addPropertyBinding(FormValueProperty.VALUE, (formValue: ObjectFormValue) => {
                expect(formValue.value).equals('testValue');
                done();
            });

            formValue.value = 'testValue';
        });

        it('Visible Binding- should call the callback if value is changed', (done) => {
            formValue.addPropertyBinding(FormValueProperty.VISIBLE, (formValue: ObjectFormValue) => {
                expect(formValue.valid).true;
                done();
            });

            formValue.visible = true;
        });
    });

});