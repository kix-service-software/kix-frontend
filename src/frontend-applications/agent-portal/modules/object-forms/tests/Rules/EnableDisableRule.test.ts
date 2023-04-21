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

describe('Rule - Enable / Disable', () => {

    describe('Enable', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ Enable: 1 }],
            'testProperty3': [{ Enable: 1 }],
            'testProperty5': [{ Enable: 1 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.enabled = false;
                (fv as any).initialState.set('enabled', false);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should be enabled', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.enabled).true;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.enabled).true;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.enabled).true;
        });

        it('not defined form values should not be enabled', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.enabled).false;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.enabled).false;
        });

    });

    describe('Disable', () => {

        let objectFormValueMapper: ObjectFormValueMapper;
        const readonlyRule = new RuleResult({
            'testProperty1': [{ Disable: 1 }],
            'testProperty3': [{ Disable: 1 }],
            'testProperty5': [{ Disable: 1 }]
        })

        before(async () => {
            objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            await objectFormValueMapper.mapFormValues(object);

            for (const fv of objectFormValueMapper.getFormValues()) {
                fv.enabled = true;
                (fv as any).initialState.set('enabled', true);
            }

            await objectFormValueMapper.applyPropertyInstructions(readonlyRule);
        });

        it('defined form values should not be enabled', () => {
            const testProperty1 = objectFormValueMapper.findFormValue('testProperty1');
            expect(testProperty1).exist;
            expect(testProperty1.enabled).false;

            const testProperty3 = objectFormValueMapper.findFormValue('testProperty3');
            expect(testProperty3).exist;
            expect(testProperty3.enabled).false;

            const testProperty5 = objectFormValueMapper.findFormValue('testProperty5');
            expect(testProperty5).exist;
            expect(testProperty5.enabled).false;
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

        it('defined form values should not have a value', () => {
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

        it('not defined form values should be enabled', () => {
            const testProperty2 = objectFormValueMapper.findFormValue('testProperty2');
            expect(testProperty2).exist;
            expect(testProperty2.enabled).true;

            const testProperty4 = objectFormValueMapper.findFormValue('testProperty4');
            expect(testProperty4).exist;
            expect(testProperty4.enabled).true;
        });

    });

});