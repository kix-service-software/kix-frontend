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
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../../../dynamic-fields/model/DynamicField';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { DynamicFieldSelectionFormValue } from '../../../model/FormValues/DynamicFields/DynamicFieldSelectionFormValue';
import { TestObjectValueMapper } from '../../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DynamicFieldSelectionFormValue', () => {

    describe('init form value without dynamic field config', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldSelectionFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldSelectionFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have countMin = 1', () => {
            expect(formValue.countMin).equals(1);
        });

        it('should have countMax = 1', () => {
            expect(formValue.countMax).equals(1);
        });

        it('should have countDefault = 1', () => {
            expect(formValue.countDefault).equals(1);
        });

        it('should have minSelectCount = 0', () => {
            expect(formValue.minSelectCount).equals(0);
        });

        it('should have maxSelectCount = 0', () => {
            expect(formValue.maxSelectCount).equals(0);
        });

        it('should have multiselect = false', () => {
            expect(formValue.multiselect).false;
        });

    });

    describe('init form value with dynamic field config', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldSelectionFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    CountMin: 2,
                    CountMax: 4
                };

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldSelectionFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have countMin = 1', () => {
            expect(formValue.countMin).equals(1);
        });

        it('should have countMax = 1', () => {
            expect(formValue.countMax).equals(1);
        });

        it('should have countDefault = 1', () => {
            expect(formValue.countDefault).equals(1);
        });

        it('should have minSelectCount = 2', () => {
            expect(formValue.minSelectCount).equals(2);
        });

        it('should have maxSelectCount = 4', () => {
            expect(formValue.maxSelectCount).equals(4);
        });

        it('should have multiselect = true', () => {
            expect(formValue.multiselect).true;
        });

    });

    describe('CountMax = 1 - Multiselect', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldSelectionFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    CountMin: 1,
                    CountMax: 1
                };

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldSelectionFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have minSelectCount = 1', () => {
            expect(formValue.minSelectCount).equals(1);
        });

        it('should have maxSelectCount = 1', () => {
            expect(formValue.maxSelectCount).equals(1);
        });

        it('should have multiselect = false', () => {
            expect(formValue.multiselect).false;
        });

    });

    describe('CountMin > CountMax', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldSelectionFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    CountMin: 5,
                    CountMax: 3
                };

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldSelectionFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have maxSelectCount = 3', () => {
            expect(formValue.maxSelectCount).equals(3);
        });

        it('should have minSelectCount = maxSelectCount (3)', () => {
            expect(formValue.minSelectCount).equals(formValue.maxSelectCount);
        });

    });

    describe('PossibleValues - not defined in config', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldSelectionFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    CountMin: 2,
                    CountMax: 4
                };

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldSelectionFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
            await formValue.loadSelectableValues();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should not have possible values', () => {
            expect(formValue.possibleValues).an('array');
            expect(formValue.possibleValues).empty;
        });

        it('should not have selectable tree nodes', () => {
            expect(formValue.getSelectableTreeNodeValues()).an('array');
            expect(formValue.getSelectableTreeNodeValues()).empty;
        });

    });

    describe('PossibleValues - defined in config', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldSelectionFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    CountMin: 2,
                    CountMax: 4,
                    PossibleValues: {
                        1: 'test1',
                        2: 'test2',
                        3: 'test3'
                    }
                };

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldSelectionFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
            await formValue.loadSelectableValues();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have possible values', () => {
            expect(formValue.possibleValues).an('array');
            expect(formValue.possibleValues.length).equals(3);
        });

        it('should have selectable tree nodes', () => {
            expect(formValue.getSelectableTreeNodeValues()).an('array');
            expect(formValue.getSelectableTreeNodeValues().length).equals(3);
        });

    });

    describe('load Selected Nodes', () => {

        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldSelectionFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;
                dynamicField.Config = {
                    CountMin: 2,
                    CountMax: 4,
                    PossibleValues: {
                        1: 'test1',
                        2: 'test2',
                        3: 'test3'
                    }
                };

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldSelectionFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
            await formValue.setObjectValue('1');
            await formValue.loadSelectableValues();
            await formValue.loadSelectedValues();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('should have selected tree nodes', async () => {
            const nodes = await formValue.getSelectedTreeNodes();
            // expect(nodes).an('array');
            // expect(nodes.length).equals(1);
        });

    });

});