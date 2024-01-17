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
import { SelectObjectFormValue } from '../../model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';
import { RuleResult } from '../../model/RuleResult';
import { TestFormObject, TestObjectValueMapper } from '../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Rule - MinSelectable / MaxSelectable', () => {

    describe('MinSelectable', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            EvaluationResult: {
                'testSelectProperty1': [{ MinSelectable: 3 }],
                'testSelectProperty3': [{ MinSelectable: 3 }],
                'testSelectProperty5': [{ MinSelectable: 3 }]
            }
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                (fv as any).initialState.set('MinSelectable', undefined);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should have minSelectionCount', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testSelectProperty1') as SelectObjectFormValue;
            expect(testProperty1).exist;
            expect(testProperty1.minSelectCount).equals(3);

            const testProperty3 = objectFormValueMapper.findFormValue('testSelectProperty3') as SelectObjectFormValue;
            expect(testProperty3).exist;
            expect(testProperty3.minSelectCount).equals(3);

            const testProperty5 = objectFormValueMapper.findFormValue('testSelectProperty5') as SelectObjectFormValue;
            expect(testProperty5).exist;
            expect(testProperty5.minSelectCount).equals(3);
        });

        it('not defined form values should not have minSelectionCount', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testSelectProperty2') as SelectObjectFormValue;
            expect(testProperty2).exist;
            expect(testProperty2.minSelectCount).not.exist;

            const testProperty4 = objectFormValueMapper.findFormValue('testSelectProperty4') as SelectObjectFormValue;
            expect(testProperty4).exist;
            expect(testProperty4.minSelectCount).not.exist;
        });

    });

    describe('MaxSelectable', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            EvaluationResult: {
                'testSelectProperty1': [{ MaxSelectable: 3 }],
                'testSelectProperty3': [{ MaxSelectable: 3 }],
                'testSelectProperty5': [{ MaxSelectable: 3 }]
            }
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                (fv as any).initialState.set('MaxSelectable', undefined);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should have maxSelectionCount', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testSelectProperty1') as SelectObjectFormValue;
            expect(testProperty1).exist;
            expect(testProperty1.maxSelectCount).equals(3);

            const testProperty3 = objectFormValueMapper.findFormValue('testSelectProperty3') as SelectObjectFormValue;
            expect(testProperty3).exist;
            expect(testProperty3.maxSelectCount).equals(3);

            const testProperty5 = objectFormValueMapper.findFormValue('testSelectProperty5') as SelectObjectFormValue;
            expect(testProperty5).exist;
            expect(testProperty5.maxSelectCount).equals(3);
        });

        it('not defined form values should not have maxSelectionCount', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testSelectProperty2') as SelectObjectFormValue;
            expect(testProperty2).exist;
            expect(testProperty2.maxSelectCount).not.exist;

            const testProperty4 = objectFormValueMapper.findFormValue('testSelectProperty4') as SelectObjectFormValue;
            expect(testProperty4).exist;
            expect(testProperty4.maxSelectCount).not.exist;
        });

    });


});