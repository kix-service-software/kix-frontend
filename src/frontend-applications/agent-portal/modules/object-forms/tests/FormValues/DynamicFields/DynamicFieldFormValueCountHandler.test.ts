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
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../../../dynamic-fields/model/DynamicField';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { DynamicFieldDateTimeFormValue } from '../../../model/FormValues/DynamicFields/DynamicFieldDateTimeFormValue';
import { DynamicFieldTextFormValue } from '../../../model/FormValues/DynamicFields/DynamicFieldTextFormValue';
import { DynamicFieldTextAreaFormValue } from '../../../model/FormValues/DynamicFields/DynamicFieldTextAreaFormValue';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { TestFormObject, TestObjectValueMapper } from '../../MockData';
import { DynamicFieldObjectFormValue } from '../../../model/FormValues/DynamicFieldObjectFormValue';
import { DynamicFieldTypes } from '../../../../dynamic-fields/model/DynamicFieldTypes';
import { RuleResult } from '../../../model/RuleResult';
import { PropertyInstruction } from '../../../model/PropertyInstruction';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DynamicFieldFormValueCountHandler', () => {
    /**
     * DynamicFieldTextFormValue
     */
    describe('DynamicFieldTextFormValue', () => {
        describe('DynamicFieldTextFormValue, no 0 values', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 1,
                        CountMax: 5,
                        CountDefault: 2
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 2 children', () => {
                expect(formValue.formValues.length).equals(2);
            });

            it('canAdd [0] should not be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).false;
            });

            it('canAdd [1] should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[1].instanceId)).true;
            });


            it('canRemove [0] should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).true;
            });

            it('canRemove [1] should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[1].instanceId)).true;
            });

            it('children should have text-form-input template', () => {
                let hasWrongTemplate = false;
                hasWrongTemplate = formValue.formValues.some((fv) => fv.inputComponentId !== "text-form-input");
                expect(hasWrongTemplate).false;
            });

            it('should be not visible', () => {
                expect(formValue.visible).false;
            });

            it('AfterRemove: should have 1 children', () => {
                formValue.removeFormValue(formValue.formValues[0].instanceId);
                expect(formValue.formValues.length).equals(1);
            });

            it('AfterRemove: canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).true;
            });

            it('AfterRemove: canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).false;
            });

            it('AfterRemove: should be not visible', () => {
                expect(formValue.visible).false;
            });
        });

        describe('DynamicFieldTextFormValue, min = 0, default = 1', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 5,
                        CountDefault: 1
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 1 children', () => {
                expect(formValue.formValues.length).equals(1);
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).true;
            });

            it('canRemove should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).true;
            });

            it('children should have text-form-input template', () => {
                let hasWrongTemplate = false;
                hasWrongTemplate = formValue.formValues.some((fv) => fv.inputComponentId !== "text-form-input");
                expect(hasWrongTemplate).false;
            });

            it('should be not visible', () => {
                expect(formValue.visible).false;
            });

            it('AfterRemove: should have 0 children', () => {
                formValue.removeFormValue(formValue.formValues[0].instanceId);
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('AfterRemove: canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('AfterRemove: canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('AfterRemove: should be visible', () => {
                expect(formValue.visible).true;
            });

            it('AfterRemove: should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldTextFormValue, min = 0, default = 0', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 5,
                        CountDefault: 0
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 0 children', () => {
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('should be visible', () => {
                expect(formValue.visible).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldTextFormValue, min = 5, default = 4, max = 0', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 5,
                        CountMax: 0,
                        CountDefault: 4
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 5 children', () => {
                expect(formValue.formValues.length).equals(5);
            });

            it('canAdd [index < length] shouldn\t be possible', () => {
                let canAdd = false;
                for (let i = 0; i < formValue.formValues.length - 1; i++) {
                    canAdd = canAdd || formValue.canAddValue(formValue.formValues[i].instanceId);
                }
                expect(canAdd).false;
            });

            it('canRemove shouldn\'t be possible on any', () => {
                let canRemove = false;
                for (let i = 0; i < formValue.formValues.length; i++) {
                    canRemove = canRemove || formValue.canRemoveValue(formValue.formValues[i].instanceId);
                }
                expect(canRemove).false;
            });

            it('shouldn\'t be visible', () => {
                expect(formValue.visible).false;
            });

            it('dfValues and formValues should have the same length', async () => {
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                const isEqual = formValue.dfValues.length === formValue.formValues.length;
                expect(isEqual).true;
            });

            it('last one should be able to add after many insterts', () => {
                const formValues = formValue.formValues;
                expect(formValue.canAddValue(formValues[formValues.length - 1].instanceId)).true;
            });


            it('canAdd [index < length] shouldn\t be possible after many inserts', () => {
                let canAdd = false;
                for (let i = 0; i < formValue.formValues.length - 1; i++) {
                    canAdd = canAdd || formValue.canAddValue(formValue.formValues[i].instanceId);
                }
                expect(canAdd).false;
            });

            it('canRemove should be possible on all', () => {
                let canRemove = true;
                for (let i = 0; i < formValue.formValues.length; i++) {
                    canRemove = canRemove && formValue.canRemoveValue(formValue.formValues[i].instanceId);
                }
                expect(canRemove).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldTextFormValue, min = 0, default = 0, max = 1', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 1,
                        CountDefault: 0
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 0 children', () => {
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('should be visible', () => {
                expect(formValue.visible).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldTextFormValue, min = 4, default = 7, max = 3', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 4,
                        CountMax: 3,
                        CountDefault: 7
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('countMax should be 3', () => {
                expect(formValue.countMax).equals(3);
            });

            it('countMin should be 3', () => {
                expect(formValue.countMin).equals(3);
            });

            it('countDefault should be 3', () => {
                expect(formValue.countDefault).equals(3);
            });
        });

        describe('DynamicFieldTextFormValue, oldMax = 15, newMax 7, default 10', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextFormValue;
            const objectValueMapper = new TestObjectValueMapper();

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 1,
                        CountMax: 15,
                        CountDefault: 10
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 10 children', () => {
                expect(formValue.formValues.length).equals(10);
            });

            it('countMax should be 7', async () => {
                const propertyInstruction = new PropertyInstruction('DunamicFields.testDF', [['CountMax']]);
                propertyInstruction.CountMax = 7;
                const rule: RuleResult = {
                    InputOrder: [],
                    propertyInstructions: [propertyInstruction],
                };
                await objectValueMapper.applyPropertyInstructionsMock(rule, formValue);
                expect(formValue.countMax).equals(7);
            });

            it('Formvalues.length should be 7', () => {
                expect(formValue.formValues.length).equals(7);
            });

        });
    });
    /**
     * DynamicFieldTextAreaFormValue
     */
    describe('DynamicFieldTextAreaFormValue', () => {
        describe('DynamicFieldTextAreaFormValue, no 0 values', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextAreaFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 1,
                        CountMax: 5,
                        CountDefault: 2
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT_AREA;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextAreaFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 2 children', () => {
                expect(formValue.formValues.length).equals(2);
            });

            it('canAdd [0] should not be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).false;
            });

            it('canAdd [1] should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[1].instanceId)).true;
            });

            it('canRemove [0] should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).true;
            });

            it('canRemove [1] should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[1].instanceId)).true;
            });

            it('children should have textarea-form-input template', () => {
                let hasWrongTemplate = false;
                hasWrongTemplate = formValue.formValues.some((fv) => fv.inputComponentId !== "textarea-form-input");
                expect(hasWrongTemplate).false;
            });

            it('should be not visible', () => {
                expect(formValue.visible).false;
            });

            it('AfterRemove: should have 1 children', () => {
                formValue.removeFormValue(formValue.formValues[0].instanceId);
                expect(formValue.formValues.length).equals(1);
            });

            it('AfterRemove: canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).true;
            });

            it('AfterRemove: canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).false;
            });

            it('AfterRemove: should be not visible', () => {
                expect(formValue.visible).false;
            });
        });

        describe('DynamicFieldTextAreaFormValue, min = 0, default = 1', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextAreaFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 5,
                        CountDefault: 1
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT_AREA;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextAreaFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 1 children', () => {
                expect(formValue.formValues.length).equals(1);
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).true;
            });

            it('canRemove should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).true;
            });

            it('children should have textarea-form-input template', () => {
                let hasWrongTemplate = false;
                hasWrongTemplate = formValue.formValues.some((fv) => fv.inputComponentId !== "textarea-form-input");
                expect(hasWrongTemplate).false;
            });

            it('should be not visible', () => {
                expect(formValue.visible).false;
            });

            it('AfterRemove: should have 0 children', () => {
                formValue.removeFormValue(formValue.formValues[0].instanceId);
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('AfterRemove: canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('AfterRemove: canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('AfterRemove: should be visible', () => {
                expect(formValue.visible).true;
            });

            it('AfterRemove: should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldTextAreaFormValue, min = 0, default = 0', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextAreaFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 5,
                        CountDefault: 0
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT_AREA;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextAreaFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 0 children', () => {
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('should be visible', () => {
                expect(formValue.visible).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });
        describe('DynamicFieldTextAreaFormValue, min = 5, default = 4, max = 0', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextAreaFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 5,
                        CountMax: 0,
                        CountDefault: 4
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT_AREA;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextAreaFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 5 children', () => {
                expect(formValue.formValues.length).equals(5);
            });

            it('canAdd [index < length] shouldn\t be possible', () => {
                let canAdd = false;
                for (let i = 0; i < formValue.formValues.length - 1; i++) {
                    canAdd = canAdd || formValue.canAddValue(formValue.formValues[i].instanceId);
                }
                expect(canAdd).false;
            });

            it('canRemove shouldn\'t be possible on any', () => {
                let canRemove = false;
                for (let i = 0; i < formValue.formValues.length; i++) {
                    canRemove = canRemove || formValue.canRemoveValue(formValue.formValues[i].instanceId);
                }
                expect(canRemove).false;
            });

            it('shouldn\'t be visible', () => {
                expect(formValue.visible).false;
            });

            it('dfValues and formValues should have the same length', async () => {
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                const isEqual = formValue.dfValues.length === formValue.formValues.length;
                expect(isEqual).true;
            });

            it('last one should be able to add after many insterts', () => {
                const formValues = formValue.formValues;
                expect(formValue.canAddValue(formValues[formValues.length - 1].instanceId)).true;
            });


            it('canAdd [index < length] shouldn\t be possible after many inserts', () => {
                let canAdd = false;
                for (let i = 0; i < formValue.formValues.length - 1; i++) {
                    canAdd = canAdd || formValue.canAddValue(formValue.formValues[i].instanceId);
                }
                expect(canAdd).false;
            });

            it('canRemove should be possible on all', () => {
                let canRemove = true;
                for (let i = 0; i < formValue.formValues.length; i++) {
                    canRemove = canRemove && formValue.canRemoveValue(formValue.formValues[i].instanceId);
                }
                expect(canRemove).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldTextAreaFormValue, min = 0, default = 0, max = 1', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextAreaFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 1,
                        CountDefault: 0
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT_AREA;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextAreaFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 0 children', () => {
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('should be visible', () => {
                expect(formValue.visible).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldTextAreaFormValue, oldMax = 15, newMax 7, default 10', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldTextAreaFormValue;
            const objectValueMapper = new TestObjectValueMapper();

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 1,
                        CountMax: 15,
                        CountDefault: 10
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldTextAreaFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 10 children', () => {
                expect(formValue.formValues.length).equals(10);
            });

            it('countMax should be 7', async () => {
                const propertyInstruction = new PropertyInstruction('DunamicFields.testDF', [['CountMax']]);
                propertyInstruction.CountMax = 7;
                const rule: RuleResult = {
                    InputOrder: [],
                    propertyInstructions: [propertyInstruction],
                };
                await objectValueMapper.applyPropertyInstructionsMock(rule, formValue);
                expect(formValue.countMax).equals(7);
            });

            it('Formvalues.length should be 7', () => {
                expect(formValue.formValues.length).equals(7);
            });

        });
    });
    /**
     * DynamicFieldDateTimeFormValue
     */
    describe('DynamicFieldDateTimeFormValue', () => {
        describe('DynamicFieldDateTimeFormValue, no 0 values', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldDateTimeFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 1,
                        CountMax: 5,
                        CountDefault: 2
                    };
                    dynamicField.FieldType = DynamicFieldTypes.DATE_TIME;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 2 children', () => {
                expect(formValue.formValues.length).equals(2);
            });

            it('canAdd [0] should not be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).false;
            });

            it('canAdd [1] should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[1].instanceId)).true;
            });

            it('canRemove [0] should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).true;
            });

            it('canRemove [1] should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[1].instanceId)).true;
            });

            it('children should have datetime-form-input template', () => {
                let hasWrongTemplate = false;
                hasWrongTemplate = formValue.formValues.some((fv) => fv.inputComponentId !== "datetime-form-input");
                expect(hasWrongTemplate).false;
            });

            it('should be not visible', () => {
                expect(formValue.visible).false;
            });

            it('AfterRemove: should have 1 children', () => {
                formValue.removeFormValue(formValue.formValues[0].instanceId);
                expect(formValue.formValues.length).equals(1);
            });

            it('AfterRemove: canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).true;
            });

            it('AfterRemove: canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).false;
            });

            it('AfterRemove: should be not visible', () => {
                expect(formValue.visible).false;
            });
        });

        describe('DynamicFieldDateTimeFormValue, min = 0, default = 1', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldDateTimeFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 5,
                        CountDefault: 1
                    };
                    dynamicField.FieldType = DynamicFieldTypes.DATE_TIME;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 1 children', () => {
                expect(formValue.formValues.length).equals(1);
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.formValues[0].instanceId)).true;
            });

            it('canRemove should be possible', () => {
                expect(formValue.canRemoveValue(formValue.formValues[0].instanceId)).true;
            });

            it('children should have datetime-form-input template', () => {
                let hasWrongTemplate = false;
                hasWrongTemplate = formValue.formValues.some((fv) => fv.inputComponentId !== "datetime-form-input");
                expect(hasWrongTemplate).false;
            });

            it('should be not visible', () => {
                expect(formValue.visible).false;
            });

            it('AfterRemove: should have 0 children', () => {
                formValue.removeFormValue(formValue.formValues[0].instanceId);
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('AfterRemove: canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('AfterRemove: canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('AfterRemove: should be visible', () => {
                expect(formValue.visible).true;
            });

            it('AfterRemove: should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldDateTimeFormValue, min = 0, default = 0', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldDateTimeFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 5,
                        CountDefault: 0
                    };
                    dynamicField.FieldType = DynamicFieldTypes.DATE_TIME;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 0 children', () => {
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('should be visible', () => {
                expect(formValue.visible).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldDateTimeFormValue, min = 5, default = 4, max = 0', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldDateTimeFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 5,
                        CountMax: 0,
                        CountDefault: 4
                    };
                    dynamicField.FieldType = DynamicFieldTypes.DATE_TIME;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 5 children', () => {
                expect(formValue.formValues.length).equals(5);
            });

            it('canAdd [index < length] shouldn\t be possible', () => {
                let canAdd = false;
                for (let i = 0; i < formValue.formValues.length - 1; i++) {
                    canAdd = canAdd || formValue.canAddValue(formValue.formValues[i].instanceId);
                }
                expect(canAdd).false;
            });

            it('canRemove shouldn\'t be possible on any', () => {
                let canRemove = false;
                for (let i = 0; i < formValue.formValues.length; i++) {
                    canRemove = canRemove || formValue.canRemoveValue(formValue.formValues[i].instanceId);
                }
                expect(canRemove).false;
            });

            it('shouldn\'t be visible', () => {
                expect(formValue.visible).false;
            });

            it('dfValues and formValues should have the same length', async () => {
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                await formValue.addFormValue(null, null);
                const isEqual = formValue.dfValues.length === formValue.formValues.length;
                expect(isEqual).true;
            });

            it('last one should be able to add after many insterts', () => {
                const formValues = formValue.formValues;
                expect(formValue.canAddValue(formValues[formValues.length - 1].instanceId)).true;
            });


            it('canAdd [index < length] shouldn\t be possible after many inserts', () => {
                let canAdd = false;
                for (let i = 0; i < formValue.formValues.length - 1; i++) {
                    canAdd = canAdd || formValue.canAddValue(formValue.formValues[i].instanceId);
                }
                expect(canAdd).false;
            });

            it('canRemove should be possible on all', () => {
                let canRemove = true;
                for (let i = 0; i < formValue.formValues.length; i++) {
                    canRemove = canRemove && formValue.canRemoveValue(formValue.formValues[i].instanceId);
                }
                expect(canRemove).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldDateTimeFormValue, min = 0, default = 0, max = 1', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldDateTimeFormValue;

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 0,
                        CountMax: 1,
                        CountDefault: 0
                    };
                    dynamicField.FieldType = DynamicFieldTypes.DATE_TIME;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const objectValueMapper = new TestObjectValueMapper();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 0 children', () => {
                try {
                    expect(formValue.formValues.length).equals(0);
                } catch {
                    expect(formValue.formValues.length).false;
                }
            });

            it('canAdd should be possible', () => {
                expect(formValue.canAddValue(formValue.instanceId)).true;
            });

            it('canRemove should not be possible', () => {
                expect(formValue.canRemoveValue(formValue.instanceId)).false;
            });

            it('should be visible', () => {
                expect(formValue.visible).true;
            });

            it('should have inputComponentId \'count-handler-form-input\'',
                () => {
                    expect(formValue.inputComponentId).equals('count-handler-form-input');
                });

        });

        describe('DynamicFieldDateTimeFormValue, oldMax = 15, newMax 7, default 10', () => {

            const originalLoadFunction = KIXObjectService.loadDynamicField;
            let formValue: DynamicFieldDateTimeFormValue;
            const objectValueMapper = new TestObjectValueMapper();

            before(async () => {
                KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                    const dynamicField = new DynamicField();
                    dynamicField.Name = name;
                    dynamicField.Config = {
                        CountMin: 1,
                        CountMax: 15,
                        CountDefault: 10
                    };
                    dynamicField.FieldType = DynamicFieldTypes.TEXT;
                    return dynamicField;
                }

                const dynamicFieldValue = new DynamicFieldValue();
                const object = new TestFormObject();
                objectValueMapper.object = object;
                const parent = new DynamicFieldObjectFormValue('Value', object, objectValueMapper, null);
                await parent.initFormValue();
                formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, parent, 'testDF');
                const field = new FormFieldConfiguration('', '', '', '');
                await formValue.initFormValueByField(field);
                await formValue.initFormValue();
                formValue.initCountValues();
            });

            after(() => {
                KIXObjectService.loadDynamicField = originalLoadFunction;
            });

            it('should have 10 children', () => {
                expect(formValue.formValues.length).equals(10);
            });

            it('countMax should be 7', async () => {
                const propertyInstruction = new PropertyInstruction('DunamicFields.testDF', [['CountMax']]);
                propertyInstruction.CountMax = 7;
                const rule: RuleResult = {
                    InputOrder: [],
                    propertyInstructions: [propertyInstruction],
                };
                await objectValueMapper.applyPropertyInstructionsMock(rule, formValue);
                expect(formValue.countMax).equals(7);
            });

            it('Formvalues.length should be 7', () => {
                expect(formValue.formValues.length).equals(7);
            });

        });
    });
});