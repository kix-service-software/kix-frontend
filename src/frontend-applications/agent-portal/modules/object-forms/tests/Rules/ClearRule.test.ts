/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

describe('Rule - Clear', () => {

    describe('Clear Value', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            EvaluationResult: {
                'testProperty1': [{ Clear: 1 }],
                'testProperty3': [{ Clear: 1 }],
                'testProperty5': [{ Clear: 1 }]
            }
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.value = 'testValue';
            }

            objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should not have value', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.value).not.exist;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.value).not.exist;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.value).not.exist;
        });

        it('not defined form values should have value', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.value).exist;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.value).exist;
        });

    });

});