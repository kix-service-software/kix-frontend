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

describe('Rule - Show / Hide', () => {

    describe('Enable Show', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            EvaluationResult: {
                'testProperty1': [{ Show: 1 }],
                'testProperty3': [{ Show: 1 }],
                'testProperty5': [{ Show: 1 }]
            }
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.visible = false;
                (fv as any).initialState.set('visible', false);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should be visible', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.visible).true;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.visible).true;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.visible).true;
        });

        it('not defined form values should not be visible', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.readonly).false;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.readonly).false;
        });

    });

    describe('Enable Hide', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            EvaluationResult: {
                'testProperty1': [{ Hide: 1 }],
                'testProperty3': [{ Hide: 1 }],
                'testProperty5': [{ Hide: 1 }]
            }
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.visible = true;
                (fv as any).initialState.set('visible', true);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should not be visible', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.visible).false;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.visible).false;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.visible).false;
        });

        it('not defined form values should be visible', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.visible).true;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.visible).true;
        });

    });

});