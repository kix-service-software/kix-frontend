/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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

describe('Rule - Required / Optional', () => {

    describe('Enable Required', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ Required: 1 }],
            'testProperty3': [{ Required: 1 }],
            'testProperty5': [{ Required: 1 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should be required', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.required).true;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.required).true;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.required).true;
        });

        it('not defined form values should not be required', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.required).false;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.required).false;
        });

    });

    describe('Enable Optional', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ Optional: 1 }],
            'testProperty3': [{ Optional: 1 }],
            'testProperty5': [{ Optional: 1 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.required = true;
                (fv as any).initialState.set('required', true);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should not be required', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.required).false;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.required).false;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.required).false;
        });

        it('not defined form values should be required', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.required).true;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.required).true;
        });

    });

});