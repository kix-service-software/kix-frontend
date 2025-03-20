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
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { TestObjectValueMapper, TestFormObject } from '../MockData';
import { ObjectFormValue } from '../../model/FormValues/ObjectFormValue';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ObjectFormValue', () => {

    describe('Init FormValue by FieldConfiguration without DefaultValue', () => {

        let formValue: ObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new ObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');

            await formValue.initFormValueByField(field);
        });

        it('The value should not be set', () => {
            expect(formValue.value).not.exist;
        });
    });

    describe('Init FormValue by FieldConfiguration with DefaultValue', () => {

        let formValue: ObjectFormValue;
        let object: TestFormObject;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            object = new TestFormObject();

            formValue = new ObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.defaultValue = new FormFieldValue('testValue');

            await formValue.initFormValueByField(field);
        });

        it('The value should be set', () => {
            expect(formValue.value).exist;
            expect(formValue.value).equals('testValue');
        });

    });

});