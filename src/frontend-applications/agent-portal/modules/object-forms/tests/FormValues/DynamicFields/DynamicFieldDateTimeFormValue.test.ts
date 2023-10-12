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
import { DynamicFieldDateTimeFormValue } from '../../../model/FormValues/DynamicFields/DynamicFieldDateTimeFormValue';
import { TestObjectValueMapper } from '../../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DynamicFieldDateTimeFormValue', () => {
    // describe('init form value without dynamic field config', () => {

    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;

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

    //     it('minDate should be null', () => {
    //         expect(formValue.minDate).not.exist;
    //     });

    //     it('maxDate should be null', () => {
    //         expect(formValue.maxDate).not.exist;
    //     });

    //     it('default value should be null', () => {
    //         expect(formValue.value).not.exist;
    //     });

    // });

    // describe('init form value with dynamic field config, dateRestriction: none', () => {

    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.Config = {
    //                 DateRestriction: 'none',
    //                 YearsInPast: '2',
    //                 YearsInFuture: '4',
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

    //     it('minDate year should be 2 years in the past', () => {
    //         const currentYear = new Date().getFullYear();
    //         expect(new Date(formValue.minDate).getFullYear()).equals(currentYear - 2);
    //     });

    //     it('maxDate year should be 4 years in the future', () => {
    //         const currentYear = new Date().getFullYear();
    //         expect(new Date(formValue.maxDate).getFullYear()).equals(currentYear + 4);
    //     });

    //     it('default value should be 01.01.2000', () => {
    //         expect(formValue.value).equals('01.01.2000');
    //     });

    // });

    // describe('init form value with dynamic field config, dateRestriction: DisablePastDates', () => {

    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.Config = {
    //                 DateRestriction: 'DisablePastDates',
    //                 YearsInPast: '2',
    //                 YearsInFuture: '4',
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

    //     it('minDate year should be this year', () => {
    //         const currentYear = new Date().getFullYear();
    //         expect(new Date(formValue.minDate).getFullYear()).equals(currentYear);
    //     });

    //     it('maxDate year should be 4 years in the future', () => {
    //         const currentYear = new Date().getFullYear();
    //         expect(new Date(formValue.maxDate).getFullYear()).equals(currentYear + 4);
    //     });

    //     it('default value should be 01.01.2000', () => {
    //         expect(formValue.value).equals('01.01.2000');
    //     });

    // });

    // describe('init form value with dynamic field config, dateRestriction: DisableFutureDates', () => {

    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let formValue: DynamicFieldDateTimeFormValue;

    //     before(async () => {
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.Config = {
    //                 DateRestriction: 'DisableFutureDates',
    //                 YearsInPast: '2',
    //                 YearsInFuture: '4',
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

    //     it('minDate year should be 2 years in the past', () => {
    //         const currentYear = new Date().getFullYear();
    //         expect(new Date(formValue.minDate).getFullYear()).equals(currentYear - 2);
    //     });

    //     it('maxDate year should be this year', () => {
    //         const currentYear = new Date().getFullYear();
    //         expect(new Date(formValue.maxDate).getFullYear()).equals(currentYear);
    //     });

    //     it('default value should be 01.01.2000', () => {
    //         expect(formValue.value).equals('01.01.2000');
    //     });

    // });

});