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
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../../../dynamic-fields/model/DynamicField';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { DynamicFieldTableFormValue } from '../../../model/FormValues/DynamicFields/DynamicFieldTableFormValue';
import { TestObjectValueMapper } from '../../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DynamicFieldTableFormValue', () => {

    describe('init form value without dynamic field config', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldTableFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldTableFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have empty columns array', () => {
            expect(formValue.columns).an('array');
            expect(formValue.columns).empty;
        });

        it('should have minRowCount = 1', () => {
            expect(formValue.minRowCount).equals(1);
        });

        it('should have maxRowCount = 1', () => {
            expect(formValue.maxRowCount).equals(1);
        });

        it('should have initialRowCount = 1', () => {
            expect(formValue.initialRowCount).equals(1);
        });

        it('should have translatableColumn = true', () => {
            expect(formValue.translatableColumn).true;
        });

        it('should have initial table with 1 row', () => {
            expect(formValue.value).exist;
            expect(formValue.value).an('array');
            expect(formValue.value.length).equals(1);
        });

    });

    describe('init form value with dynamic field config', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldTableFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    TranslatableColumn: false,
                    Columns: ['Col1', 'Col2'],
                    RowsMin: 2,
                    RowsMax: 3,
                    RowsInit: 2
                }

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldTableFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have columns array', () => {
            expect(formValue.columns).an('array');
            expect(formValue.columns.length).equals(2);
        });

        it('should have minRowCount = 2', () => {
            expect(formValue.minRowCount).equals(2);
        });

        it('should have maxRowCount = 3', () => {
            expect(formValue.maxRowCount).equals(3);
        });

        it('should have initialRowCount = 2', () => {
            expect(formValue.initialRowCount).equals(2);
        });

        it('should have translatableColumn = true', () => {
            expect(formValue.translatableColumn).false;
        });

        it('should have initial table with 2 rows', () => {
            expect(formValue.value).exist;
            expect(formValue.value).an('array');
            expect(formValue.value.length).equals(2);
        });

    });

    describe('RowsInit (2) < RowsMin (3) / RowsMax (5) - should create a correct table', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldTableFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    TranslatableColumn: false,
                    Columns: ['Col1', 'Col2'],
                    RowsMin: 3,
                    RowsMax: 5,
                    RowsInit: 2
                }

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldTableFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have initial table with 3 rows', () => {
            expect(formValue.value).exist;
            expect(formValue.value).an('array');
            expect(formValue.value.length).equals(3);
        });

    });

    describe('RowsInit (50) > RowsMax (5) / RowsMin (2) - should create a correct table', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldTableFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    TranslatableColumn: false,
                    Columns: ['Col1', 'Col2'],
                    RowsMin: 2,
                    RowsMax: 5,
                    RowsInit: 50
                }

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldTableFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have initial table with 2 rows', () => {
            expect(formValue.value).exist;
            expect(formValue.value).an('array');
            expect(formValue.value.length).equals(2);
        });

    });

    describe('RowsMin (0) / RowsMax (1) / RowsInit (0) - should create a correct table', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldTableFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    TranslatableColumn: false,
                    Columns: ['Col1', 'Col2'],
                    RowsMin: 0,
                    RowsMax: 1,
                    RowsInit: 0
                }

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldTableFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have initial table with 1 rows', () => {
            expect(formValue.value).exist;
            expect(formValue.value).an('array');
            expect(formValue.value.length).equals(1);
        });

    });

    describe('RowsMin (0) / RowsMax (0) / RowsInit (0) - should create a correct table', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldTableFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    TranslatableColumn: false,
                    Columns: ['Col1', 'Col2'],
                    RowsMin: 0,
                    RowsMax: 0,
                    RowsInit: 0
                }

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldTableFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have initial table with 1 rows', () => {
            expect(formValue.value).exist;
            expect(formValue.value).an('array');
            expect(formValue.value.length).equals(1);
        });

    });
});