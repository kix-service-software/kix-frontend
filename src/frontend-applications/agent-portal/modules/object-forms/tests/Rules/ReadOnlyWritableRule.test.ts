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

describe('Rule - ReadOnly / Writeable', () => {

    describe('Enable ReadOnly', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ ReadOnly: 1 }],
            'testProperty3': [{ ReadOnly: 1 }],
            'testProperty5': [{ ReadOnly: 1 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should be readonly', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.readonly).true;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.readonly).true;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.readonly).true;
        });

        it('not defined form values should not be readonly', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.readonly).false;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.readonly).false;
        });

    });

    describe('Disable Readonly', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ ReadOnly: 0 }],
            'testProperty3': [{ ReadOnly: 0 }],
            'testProperty5': [{ ReadOnly: 0 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.readonly = true;
                (fv as any).initialState.set('readonly', true);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should not be readonly', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.readonly).false;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.readonly).false;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.readonly).false;
        });

        it('not defined form values should be readonly', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.readonly).true;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.readonly).true;
        });

    });

    describe('Disable Writeable', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ Writeable: 0 }],
            'testProperty3': [{ Writeable: 0 }],
            'testProperty5': [{ Writeable: 0 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);
            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should be readonly', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.readonly).true;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.readonly).true;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.readonly).true;
        });

        it('not defined form values should not be readonly', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.readonly).false;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.readonly).false;
        });

    });

    describe('Enable Writeable', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ Writeable: 1 }],
            'testProperty3': [{ Writeable: 1 }],
            'testProperty5': [{ Writeable: 1 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.readonly = true;
                (fv as any).initialState.set('readonly', true);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should not be readonly', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.readonly).false;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.readonly).false;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.readonly).false;
        });

        it('not defined form values should be readonly', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.readonly).true;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.readonly).true;
        });

    });
});