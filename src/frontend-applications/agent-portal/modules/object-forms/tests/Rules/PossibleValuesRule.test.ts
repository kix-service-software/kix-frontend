/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';
import { RuleResult } from '../../model/RuleResult';
import { TestFormObject, TestObjectValueMapper } from '../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Rule - PossibleValues / Add / Remove', () => {

    describe('Set Possible Values', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ PossibleValues: [1, 2, 3] }],
            'testProperty3': [{ PossibleValues: [1, 2, 3] }],
            'testProperty5': [{ PossibleValues: [1, 2, 3] }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should have possible values', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.possibleValues).an('array');

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.possibleValues).an('array');

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.possibleValues).an('array');
        });

        it('not defined form values should not have possible values', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.possibleValues).not.exist;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.possibleValues).not.exist;
        });

    });

    describe('Add Possible Values', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ PossibleValuesAdd: [4, 5] }],
            'testProperty3': [{ PossibleValuesAdd: [4, 5] }],
            'testProperty5': [{ PossibleValuesAdd: [4, 5] }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.possibleValues = [1, 2, 3];
                (fv as any).initialState.set('possibleValues', [1, 2, 3]);
            }
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('possible values should be added to defined form values', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.possibleValues).an('array');
            expect(testProperty1.possibleValues.length).equals(5);

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.possibleValues).an('array');
            expect(testProperty3.possibleValues.length).equals(5);

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.possibleValues).an('array');
            expect(testProperty5.possibleValues.length).equals(5);
        });

        it('possible values should not be added to defined form values', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.possibleValues).an('array');
            expect(testProperty2.possibleValues.length).equals(3);

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.possibleValues).an('array');
            expect(testProperty4.possibleValues.length).equals(3);
        });

    });

    describe('Add Possible Values if no possible values array is defined in form value', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ PossibleValuesAdd: [4, 5] }],
            'testProperty3': [{ PossibleValuesAdd: [4, 5] }],
            'testProperty5': [{ PossibleValuesAdd: [4, 5] }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('possible values should be added to defined form values', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.possibleValues).an('array');
            expect(testProperty1.possibleValues.length).equals(2);

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.possibleValues).an('array');
            expect(testProperty3.possibleValues.length).equals(2);

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.possibleValues).an('array');
            expect(testProperty5.possibleValues.length).equals(2);
        });

        it('possible values should not be added to defined form values', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.possibleValues).not.exist;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.possibleValues).not.exist;
        });

    });

    describe('Remove Possible Values', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ PossibleValuesRemove: [2, 3] }],
            'testProperty3': [{ PossibleValuesRemove: [2, 3] }],
            'testProperty5': [{ PossibleValuesRemove: [2, 3] }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('forbidden values should be set in form values', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.forbiddenValues).an('array');
            expect(testProperty1.forbiddenValues.length).equals(2);

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.forbiddenValues).an('array');
            expect(testProperty3.forbiddenValues.length).equals(2);

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.forbiddenValues).an('array');
            expect(testProperty5.forbiddenValues.length).equals(2);
        });

        it('forbidden values should not be set in form values', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.forbiddenValues).not.exist;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.possibleValues).not.exist;
        });

    });

    describe('Remove Possible Values with not existing values', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ PossibleValuesRemove: [2, 3, 5, 6] }],
            'testProperty3': [{ PossibleValuesRemove: [2, 3, 5, 6] }],
            'testProperty5': [{ PossibleValuesRemove: [2, 3, 5, 6] }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('forbidden values should be set in form values', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.forbiddenValues).an('array');
            expect(testProperty1.forbiddenValues.length).equals(4);

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.forbiddenValues).an('array');
            expect(testProperty3.forbiddenValues.length).equals(4);

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.forbiddenValues).an('array');
            expect(testProperty5.forbiddenValues.length).equals(4);
        });

        it('forbidden values should not be set in form values', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.forbiddenValues).not.exist;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.forbiddenValues).not.exist;
        });

    });

    describe('Handle Possible Values', () => {

        describe('Handle current value if removed with PossibleValuesRemove', () => {

            let objectFormValueMapper: ObjectFormValueMapper;
            const readonlyRule = new RuleResult({
                'testProperty1': [{ PossibleValuesRemove: [2, 3] }],
                'testProperty3': [{ PossibleValuesRemove: [2] }],
                'testProperty5': [{ PossibleValuesRemove: [1, 2] }],
            });

            before(async () => {
                objectFormValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();

                await objectFormValueMapper.mapFormValues(object);

                const value1 = objectFormValueMapper.findFormValue('testProperty1');
                value1.possibleValues = [1, 2, 3];
                (value1 as any).initialState.set('possibleValues', [1, 2, 3]);
                value1.value = 3;

                const value3 = objectFormValueMapper.findFormValue('testProperty3');
                value3.possibleValues = [1, 2, 3];
                (value3 as any).initialState.set('possibleValues', [1, 2, 3]);
                value3.value = 3;

                const value5 = objectFormValueMapper.findFormValue('testProperty5');
                value5.possibleValues = [1, 2, 3];
                (value5 as any).initialState.set('possibleValues', [1, 2, 3]);
                value5.value = [2, 3];

                objectFormValueMapper.applyPropertyInstructions(readonlyRule);
            });

            it('should set value to null', () => {
                const formValue = objectFormValueMapper.findFormValue('testProperty1');
                expect(formValue).exist;
                expect(formValue.value).not.exist;
            });

            it('value should not be removed if not removed with PossibleValuesRemove', () => {
                const formValue = objectFormValueMapper.findFormValue('testProperty3');
                expect(formValue).exist;
                expect(formValue.value).an('array');
                expect(formValue.value.length).equals(1);
                expect(formValue.value[0]).equals(3);
            });

            it('Multiselect: should remove one value and leave one value', () => {
                const formValue = objectFormValueMapper.findFormValue('testProperty5');
                expect(formValue).exist;
                expect(formValue.value).an('array');
                expect(formValue.value.length).equals(1);
                expect(formValue.value[0]).equals(3);
            });

        });

    });
});