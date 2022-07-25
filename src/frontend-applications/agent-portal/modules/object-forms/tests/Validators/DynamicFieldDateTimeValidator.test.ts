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
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { DynamicFieldDateTimeFormValue } from '../../model/FormValues/DynamicFields/DynamicFieldDateTimeFormValue';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { TestObjectValueMapper } from '../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DynamicFieldDateTimeFormValidator', () => {
    // describe('Entered date is smaller than minDate', () => {
    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.Config = {
    //                 DateRestriction: 'none',
    //                 YearsInPast: '2',
    //                 YearsInFuture: '0',
    //                 DefaultValue: '01.01.2000'
    //             };

    //             return dynamicField;
    //         }

    //         const dynamicFieldValue = new DynamicFieldValue();
    //         const objectValueMapper = new TestObjectValueMapper();
    //         formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
    //         await formValue.initFormValue();
    //     });

    //     after(() => {
    //         KIXObjectService.loadDynamicField = originalLoadFunction;
    //     });


    //     it('should have an "out of boundaries" error', async () => {
    //         const validator: DynamicFieldDateTimeValidator = new DynamicFieldDateTimeValidator();
    //         const resultArr = await validator.validate(formValue);
    //         const fieldLabel = await TranslationService.translate(formValue.label);
    //         const errorString = await TranslationService.translate(
    //             'Translatable#The entered date is out of boundaries.', [fieldLabel]
    //         );
    //         expect(resultArr.some(el => el.message === errorString)).true;
    //         expect(resultArr.length).to.be.greaterThanOrEqual(1);
    //     });
    // });

    // describe('Entered date is bigger than maxDate', () => {
    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.Config = {
    //                 DateRestriction: 'none',
    //                 YearsInPast: '0',
    //                 YearsInFuture: '2',
    //                 DefaultValue: '01.01.9999'
    //             };

    //             return dynamicField;
    //         }

    //         const dynamicFieldValue = new DynamicFieldValue();
    //         const objectValueMapper = new TestObjectValueMapper();
    //         formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
    //         await formValue.initFormValue();
    //     });

    //     after(() => {
    //         KIXObjectService.loadDynamicField = originalLoadFunction;
    //     });


    //     it('should have an "out of boundaries" error', async () => {
    //         const validator: DynamicFieldDateTimeValidator = new DynamicFieldDateTimeValidator();
    //         const resultArr = await validator.validate(formValue);
    //         const fieldLabel = await TranslationService.translate(formValue.label);
    //         const errorString = await TranslationService.translate(
    //             'Translatable#The entered date is out of boundaries.', [fieldLabel]
    //         );
    //         expect(resultArr.some(el => el.message === errorString)).true;
    //         expect(resultArr.length).to.be.greaterThanOrEqual(1);
    //     });
    // });
    // describe('Entered date has no boundaries', () => {
    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.Config = {
    //                 DateRestriction: 'none',
    //                 YearsInPast: '0',
    //                 YearsInFuture: '0',
    //                 DefaultValue: '01.01.2000'
    //             };

    //             return dynamicField;
    //         }

    //         const dynamicFieldValue = new DynamicFieldValue();
    //         const objectValueMapper = new TestObjectValueMapper();
    //         formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
    //         formValue.value = new Date().toISOString();
    //         await formValue.initFormValue();
    //     });

    //     after(() => {
    //         KIXObjectService.loadDynamicField = originalLoadFunction;
    //     });


    //     it('shouldn\'t have any errors', async () => {
    //         const validator: DynamicFieldDateTimeValidator = new DynamicFieldDateTimeValidator();
    //         const resultArr = await validator.validate(formValue);
    //         expect(resultArr.length).equals(0);
    //     });
    // });

    // describe('Entered date is NaN', () => {
    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.Config = {
    //                 DateRestriction: 'none',
    //                 YearsInPast: '0',
    //                 YearsInFuture: '0',
    //                 DefaultValue: 'NaN NaN'
    //             };

    //             return dynamicField;
    //         }

    //         const dynamicFieldValue = new DynamicFieldValue();
    //         const objectValueMapper = new TestObjectValueMapper();
    //         formValue = new DynamicFieldDateTimeFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
    //         formValue.value = new Date().toISOString();
    //         await formValue.initFormValue();
    //     });

    //     after(() => {
    //         KIXObjectService.loadDynamicField = originalLoadFunction;
    //     });


    //     it('should have an "invalid date-time value" error', async () => {
    //         const validator: DynamicFieldDateTimeValidator = new DynamicFieldDateTimeValidator();
    //         const resultArr = await validator.validate(formValue);
    //         const fieldLabel = await TranslationService.translate(formValue.label);
    //         const errorString = await TranslationService.translate(
    //             'Translatable#Entered date-time value is invalid.', [fieldLabel]
    //         );
    //         expect(resultArr.length).to.be.greaterThanOrEqual(1);
    //         expect(resultArr.some(el => el.message === errorString)).true;
    //     });
    // });

});
