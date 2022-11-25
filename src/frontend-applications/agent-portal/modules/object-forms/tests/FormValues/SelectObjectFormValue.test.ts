/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { SelectObjectFormValue } from '../../model/FormValues/SelectObjectFormValue';
import { TestObjectValueMapper, TestFormObject } from '../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SelectObjectFormValue', () => {

    describe('Init form value', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            await formValue.initFormValue();
        });

        it('objectType should not be set', () => {
            expect(formValue.objectType).not.exist;
        });

        it('autoCompleteConfiguration should not be set', () => {
            expect(formValue.autoCompleteConfiguration).not.exist;
        });

        it('isAutoComplete should be true', () => {
            expect(formValue.isAutoComplete).false;
        });

        it('loadingOptions should not be set', () => {
            expect(formValue.loadingOptions).not.exist;
        });

        it('specificLoadingOptions should not be set', () => {
            expect(formValue.specificLoadingOptions).not.exist;
        });

        it('uniqueNodes should not be true', () => {
            expect(formValue.uniqueNodes).true;
        });

        it('objectIds should not be set', () => {
            expect(formValue.objectIds).not.exist;
        });

        it('showInvalidNodes should be true', () => {
            expect(formValue.showInvalidNodes).false;
        });

        it('isInvalidClickable should be false', () => {
            expect(formValue.isInvalidClickable).false;
        });

        it('useTextAsId should be false', () => {
            expect(formValue.useTextAsId).false;
        });

        it('multiselect should be false', () => {
            expect(formValue.multiselect).false;
        });

        it('freeText should be false', () => {
            expect(formValue.freeText).false;
        });

        it('translatable should be true', () => {
            expect(formValue.translatable).true;
        });

        it('structureOption should be true', () => {
            expect(formValue.structureOption).true;
        });

        it('fieldOptions should not be set', () => {
            expect(formValue.fieldOptions).not.exist;
        });

        it('minSelectCount should not be set', () => {
            expect(formValue.minSelectCount).not.exist;
        });

        it('maxSelectCount should not be set', () => {
            expect(formValue.maxSelectCount).not.exist;
        });

        it('selectedTreeNodes should be an empty array', async () => {
            const nodes = await formValue.getSelectedTreeNodes();
            expect(nodes).an('array');
            expect(nodes.length).equals(0);
        });

        it('selectableTreeNodes should be an empty array', () => {
            expect(formValue.getSelectableTreeNodeValues()).an('array');
            expect(formValue.getSelectableTreeNodeValues().length).equals(0);
        });

    });

    describe('Init form value with field and without options', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            await formValue.initFormValueByField(field);
        });

        it('objectType should not be set', () => {
            expect(formValue.objectType).not.exist;
        });

        it('autoCompleteConfiguration should not be set', () => {
            expect(formValue.autoCompleteConfiguration).not.exist;
        });

        it('isAutoComplete should be true', () => {
            expect(formValue.isAutoComplete).false;
        });

        it('loadingOptions should not be set', () => {
            expect(formValue.loadingOptions).not.exist;
        });

        it('specificLoadingOptions should not be set', () => {
            expect(formValue.specificLoadingOptions).not.exist;
        });

        it('uniqueNodes should not be true', () => {
            expect(formValue.uniqueNodes).true;
        });

        it('objectIds should not be set', () => {
            expect(formValue.objectIds).not.exist;
        });

        it('showInvalidNodes should be true', () => {
            expect(formValue.showInvalidNodes).false;
        });

        it('isInvalidClickable should be false', () => {
            expect(formValue.isInvalidClickable).false;
        });

        it('useTextAsId should be false', () => {
            expect(formValue.useTextAsId).false;
        });

        it('multiselect should be false', () => {
            expect(formValue.multiselect).false;
        });

        it('freeText should be false', () => {
            expect(formValue.freeText).false;
        });

        it('translatable should be true', () => {
            expect(formValue.translatable).true;
        });

        it('structureOption should be true', () => {
            expect(formValue.structureOption).true;
        });

        it('fieldOptions should not be set', () => {
            expect(formValue.fieldOptions).not.exist;
        });

        it('minSelectCount should not be set', () => {
            expect(formValue.minSelectCount).not.exist;
        });

        it('maxSelectCount should not be set', () => {
            expect(formValue.maxSelectCount).not.exist;
        });

        it('selectedTreeNodes should be an empty array', async () => {
            const nodes = await formValue.getSelectedTreeNodes();
            expect(nodes).an('array');
            expect(nodes.length).equals(0);
        });

        it('selectableTreeNodes should be an empty array', () => {
            expect(formValue.getSelectableTreeNodeValues()).an('array');
            expect(formValue.getSelectableTreeNodeValues().length).equals(0);
        });

    });

    describe('Init form value with field and with OBJECT option', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, 'TestObjectType')
            ]
            await formValue.initFormValueByField(field);
        });

        it('form value should have correct objectType', () => {
            expect(formValue.objectType).equals('TestObjectType');
        });

    });

    describe('Init form value with field and with LOADINGOPTIONS option', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS, new KIXObjectLoadingOptions())
            ]
            await formValue.initFormValueByField(field);
        });

        it('form value should have  loadingOptions', () => {
            expect(formValue.loadingOptions).exist;
        });

    });

    describe('Init form value with field and with OBJECT_IDS option', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption(ObjectReferenceOptions.OBJECT_IDS, [1, 2, 3])
            ]
            await formValue.initFormValueByField(field);
        });

        it('form value should have objectIds', () => {
            expect(formValue.objectIds).exist;
            expect(formValue.objectIds).an('array');
            expect(formValue.objectIds.length).equals(3);
        });

    });

    describe('Init form value with field and with SHOW_INVALID option', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption(FormFieldOptions.SHOW_INVALID, true)
            ]
            await formValue.initFormValueByField(field);
        });

        it('form value should have showInvalidNodes', () => {
            expect(formValue.showInvalidNodes).true;
        });

    });

    describe('Init form value with field and with INVALID_CLICKABLE option', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ]
            await formValue.initFormValueByField(field);
        });

        it('form value should have isInvalidClickable', () => {
            expect(formValue.isInvalidClickable).true;
        });

    });

    describe('Init form value with field and with count options', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);

            const field = new FormFieldConfiguration('', '', '', '');
            field.options = [
                new FormFieldOption(ObjectReferenceOptions.COUNT_MIN, 1),
                new FormFieldOption(ObjectReferenceOptions.COUNT_MAX, 3)
            ]
            await formValue.initFormValueByField(field);
        });

        it('form value should have a maxSelectCount', () => {
            expect(formValue.maxSelectCount).equals(3);
        });

        it('form value should have a minSelectCount', () => {
            expect(formValue.minSelectCount).equals(1);
        });
    });

    describe('Multiselect + FreeText: Filter selected values', () => {

        let formValue: SelectObjectFormValue;

        before(async () => {
            const objectFormValueMapper = new TestObjectValueMapper();
            const object = new TestFormObject();

            formValue = new SelectObjectFormValue('testProperty1', object, objectFormValueMapper, null);
            formValue.initFormValue();

            const values = ['', null, undefined, 3, '*asd', 'something', '7', '***', 8, '        '];
            formValue.multiselect = true;
            formValue.freeText = true;
            formValue.setFormValue(values);
        });

        it('Should have length 4', () => {
            expect(formValue.value.length).equals(4);
        });

        it('Should only have valid values', () => {
            expect(formValue.value).to.deep.equal([3, 'something', '7', 8]);
        });
    });

});