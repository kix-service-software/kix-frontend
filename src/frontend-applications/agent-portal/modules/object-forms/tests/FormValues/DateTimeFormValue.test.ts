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
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { DateTimeFormValue } from '../../model/FormValues/DateTimeFormValue';
import { TestFormObject, TestObjectValueMapper } from '../MockData';
import { InputFieldTypes } from '../../../base-components/webapp/core/InputFieldTypes';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DateTimeFormValue', () => {

    describe('Init FormValue by FieldConfiguration without options', () => {
        let formValue: DateTimeFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new DateTimeFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');

            await formValue.initFormValueByField(field);
        });

        it('The input type should be DATE_TIME', () => {
            expect(formValue.inputType).equals(InputFieldTypes.DATE_TIME);
        });

        it('should not have a min date', () => {
            expect(formValue.minDate).not.exist;
        });

        it('should not have a max date', () => {
            expect(formValue.maxDate).not.exist;
        });
    });

    describe('Init FormValue by FieldConfiguration with INPUT_FIELD_TYPE', () => {
        let formValue: DateTimeFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new DateTimeFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.DATE)];

            await formValue.initFormValueByField(field);
        });

        it('The input type should be DATE', () => {
            expect(formValue.inputType).equals(InputFieldTypes.DATE);
        });
    });

    describe('Init FormValue by FieldConfiguration with MIN_DATE', () => {
        let formValue: DateTimeFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new DateTimeFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [new FormFieldOption(FormFieldOptions.MIN_DATE, '2022-10-09 22:13:00')];

            await formValue.initFormValueByField(field);
        });

        it('The min date should be set', () => {
            expect(formValue.minDate).exist;
        });
    });

    describe('Init FormValue by FieldConfiguration with MAX_DATE', () => {
        let formValue: DateTimeFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new DateTimeFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [new FormFieldOption(FormFieldOptions.MAX_DATE, '2022-10-09 22:13:00')];

            await formValue.initFormValueByField(field);
        });

        it('The max date should be set', () => {
            expect(formValue.maxDate).exist;
        });
    });

});