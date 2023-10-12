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
import { ConfigItemProperty } from '../../../../cmdb/model/ConfigItemProperty';
import { DynamicField } from '../../../../dynamic-fields/model/DynamicField';
import { DynamicFieldTypes } from '../../../../dynamic-fields/model/DynamicFieldTypes';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { DynamicFieldCIReferenceFormValue } from '../../../model/FormValues/DynamicFields/DynamicFieldCIReferenceFormValue';
import { ObjectFormValueMapper } from '../../../model/ObjectFormValueMapper';
import { TestFormObject, TestObjectValueMapper } from '../../MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DynamicFieldCIReferenceFormValue', () => {

    describe('Init form value without dynamic field config', () => {
        const originalLoadFunction = KIXObjectService.loadDynamicField;
        let formValue: DynamicFieldCIReferenceFormValue;

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                const dynamicField = new DynamicField();
                dynamicField.Name = name;

                return dynamicField;
            }

            const dynamicFieldValue = new DynamicFieldValue();
            const objectValueMapper = new TestObjectValueMapper();
            formValue = new DynamicFieldCIReferenceFormValue('Value', dynamicFieldValue, objectValueMapper, null, 'testDF');
            await formValue.initFormValue();
        });

        after(() => {
            KIXObjectService.loadDynamicField = originalLoadFunction;
        });

        it('CountMin = 1', () => {
            expect(formValue.countMin).equals(1);
        });

        it('CountMax = 1', () => {
            expect(formValue.countMax).equals(1);
        });

        it('CountDefault = 1', () => {
            expect(formValue.countDefault).equals(1);
        });

        it('minSelectCount = 0', () => {
            expect(formValue.minSelectCount).equals(0);
        });

        it('maxSelectCount = 1', () => {
            expect(formValue.maxSelectCount).equals(1);
        });

        it('autoComplete = true', () => {
            expect(formValue.isAutoComplete).true;
        });

        it('has autoComplete configuration', () => {
            expect(formValue.autoCompleteConfiguration).exist;
        });
    });

    // describe('Init form value with dynamic field config', () => {
    //     const originalLoadFunction = KIXObjectService.loadDynamicField;
    //     let originalTranslateFunction = TranslationService.translate;
    //     let objectValueMapper: ObjectFormValueMapper;
    //     let formValue: DynamicFieldCIReferenceFormValue;

    //     before(async () => {
    //         TranslationService.translate = async (pattern: string): Promise<string> => pattern;
    //         KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
    //             const dynamicField = new DynamicField();
    //             dynamicField.Name = name;
    //             dynamicField.FieldType = DynamicFieldTypes.CI_REFERENCE;
    //             dynamicField.Label = 'TestDF';

    //             dynamicField.Config = {
    //                 CountDefault: 0,
    //                 CountMax: 15,
    //                 CountMin: 2,
    //                 DefaultValue: 4,
    //                 DeploymentStates: [16, 17],
    //                 ITSMConfigItemClasses: [4, 9]
    //             }

    //             return dynamicField;
    //         }

    //         objectValueMapper = new TestObjectValueMapper();

    //         const object = new TestFormObject(['testDF']);
    //         await objectValueMapper.mapFormValues(object);
    //         formValue = objectValueMapper.findFormValue('DynamicFields.testDF') as DynamicFieldCIReferenceFormValue;
    //     });

    //     after(() => {
    //         KIXObjectService.loadDynamicField = originalLoadFunction;
    //         TranslationService.translate = originalTranslateFunction;
    //     });

    //     it('should have a form value for dynamic field', () => {
    //         expect(formValue).exist;
    //     });

    //     it('CountMin = 1', () => {
    //         expect(formValue.countMin).equals(1);
    //     });

    //     it('CountMax = 1', () => {
    //         expect(formValue.countMax).equals(1);
    //     });

    //     it('CountDefault = 1', () => {
    //         expect(formValue.countDefault).equals(1);
    //     });

    //     it('minSelectCount = 2', () => {
    //         expect(formValue.minSelectCount).equals(2);
    //     });

    //     it('maxSelectCount = 15', () => {
    //         expect(formValue.maxSelectCount).equals(15);
    //     });

    //     it('autoComplete = true', () => {
    //         expect(formValue.isAutoComplete).true;
    //     });

    //     it('has autoComplete configuration', () => {
    //         expect(formValue.autoCompleteConfiguration).exist;
    //     });

    //     it('value = 4', () => {
    //         expect(formValue.value).equals(4);
    //     });

    //     it('Should have loading options', () => {
    //         expect(formValue.loadingOptions).exist;
    //     });

    //     it('Loading options should have a filter', () => {
    //         expect(formValue.loadingOptions.filter).exist;
    //         expect(formValue.loadingOptions.filter).an('array');
    //     });

    //     it('Loading options filter should contain 2 filter criterias', () => {
    //         expect(formValue.loadingOptions.filter.length).equals(2);
    //     });

    //     it('Filter should contain a criteria for deployment state ids', () => {
    //         const criteria = formValue.loadingOptions.filter.find((f) => f.property === ConfigItemProperty.CUR_DEPL_STATE_ID);
    //         expect(criteria).exist;

    //         expect(criteria.value).an('array');
    //         expect((criteria.value as any[]).length).equals(2);

    //         expect((criteria.value as any[]).some((v) => v === 16)).true;
    //         expect((criteria.value as any[]).some((v) => v === 17)).true;
    //     });

    //     it('Filter should contain a criteria for class ids', () => {
    //         const criteria = formValue.loadingOptions.filter.find((f) => f.property === ConfigItemProperty.CLASS_ID);
    //         expect(criteria).exist;

    //         expect(criteria.value).an('array');
    //         expect((criteria.value as any[]).length).equals(2);

    //         expect((criteria.value as any[]).some((v) => v === 4)).true;
    //         expect((criteria.value as any[]).some((v) => v === 9)).true;
    //     });
    // });

});