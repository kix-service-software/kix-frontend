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
import { AutocompleteFormFieldOption } from '../../../../model/AutocompleteFormFieldOption';
import { AutocompleteOption } from '../../../../model/AutocompleteOption';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { RichTextFormValue } from '../../model/FormValues/RichTextFormValue';
import { TestObjectValueMapper, TestFormObject } from '../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('RichTextFormValue', () => {

    describe('Init form value without options', () => {

        let formValue: RichTextFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new RichTextFormValue('testProperty1', object, objectFormValueMapper, null);

            await formValue.initFormValue();
        });

        it('Option NO_IMAGES should not be true', () => {
            expect(formValue.noImages).false;
        });

        it('Option AutoComplete should be empty', () => {
            expect(formValue.autocompleteOption).exist;
            expect(formValue.autocompleteOption.autocompleteObjects).an('array');
            expect(formValue.autocompleteOption.autocompleteObjects).empty;
        });

    });

    describe('Check NO_IMAGES option', () => {

        let formValue: RichTextFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption('NO_IMAGES', true)
            ];

            formValue = new RichTextFormValue('testProperty1', object, objectFormValueMapper, null);

            await formValue.initFormValueByField(field);
        });

        it('Option NO_IMAGES should be true', () => {
            expect(formValue.noImages).true;
        });

        it('Option AutoComplete should be empty', () => {
            expect(formValue.autocompleteOption).exist;
            expect(formValue.autocompleteOption.autocompleteObjects).an('array');
            expect(formValue.autocompleteOption.autocompleteObjects).empty;
        });

    });

    describe('Check Autocomplete option', () => {

        let formValue: RichTextFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')]))
            ];

            formValue = new RichTextFormValue('testProperty1', object, objectFormValueMapper, null);

            await formValue.initFormValueByField(field);
        });

        it('Option NO_IMAGES should be false', () => {
            expect(formValue.noImages).false;
        });

        it('Option AutoComplete should exist', () => {
            expect(formValue.autocompleteOption).exist;
        });

    });

});